# Wallet Blocklist Feature Guide

## Overview

The Wallet Blocklist feature provides a safeguard mechanism to prevent bad actors from transferring native coins on the Splendor blockchain. This feature allows administrators to blocklist/pause specific wallet addresses, preventing them from sending or receiving native coin transactions.

## Architecture

The blocklist system consists of two main components:

### 1. Smart Contract (`WalletBlocklist.sol`)
- **Location**: `System-Contracts/contracts/WalletBlocklist.sol`
- **Address**: `0x0000000000000000000000000000000000001007` (system contract)
- **Purpose**: Manages the list of blocklisted addresses on-chain

### 2. Go Implementation (`wallet_blocklist.go`)
- **Location**: `Core-Blockchain/node_src/core/wallet_blocklist.go`
- **Purpose**: Checks blocklist status during transaction validation

## Features

### Smart Contract Features

1. **Add to Blocklist**: Add individual or multiple addresses to the blocklist
2. **Remove from Blocklist**: Remove addresses from the blocklist
3. **Query Blocklist**: Check if an address is blocklisted
4. **Get Blocklist Info**: Retrieve detailed information about a blocklisted address
5. **Pagination Support**: Retrieve blocklisted addresses in batches
6. **Event Logging**: All blocklist operations emit events for transparency

### Transaction Validation

- **Sender Check**: Prevents blocklisted addresses from sending transactions
- **Recipient Check**: Prevents sending transactions to blocklisted addresses
- **Early Rejection**: Transactions are rejected before gas is consumed
- **Error Messages**: Clear error messages indicate why a transaction was rejected

## Deployment

### 1. Deploy the Smart Contract

Add the WalletBlocklist contract to your genesis.json or deploy it to the system contract address:

```json
{
  "0x0000000000000000000000000000000000001007": {
    "balance": "0x0",
    "code": "<compiled bytecode of WalletBlocklist.sol>"
  }
}
```

### 2. Initialize the Contract

After deployment, initialize the contract by calling the `initialize()` function:

```javascript
// Using web3.js
const contract = new web3.eth.Contract(WalletBlocklistABI, '0x0000000000000000000000000000000000001007');
await contract.methods.initialize().send({ from: adminAddress });
```

### 3. Configure the Node

The blocklist checker is enabled by default. If you need to use a different contract address, update it in your node configuration or code:

```go
import "github.com/ethereum/go-ethereum/core"

// Set custom blocklist contract address
core.SetBlocklistContractAddress(common.HexToAddress("0xYourCustomAddress"))
```

## Usage

### Adding Addresses to Blocklist

#### Single Address

```javascript
// Using web3.js
const contract = new web3.eth.Contract(WalletBlocklistABI, '0x0000000000000000000000000000000000001007');

await contract.methods.addToBlocklist(
  '0xBadActorAddress',
  'Reason: Fraudulent activity detected'
).send({ from: adminAddress });
```

#### Multiple Addresses (Batch)

```javascript
const addresses = [
  '0xBadActor1',
  '0xBadActor2',
  '0xBadActor3'
];

const reasons = [
  'Reason: Phishing',
  'Reason: Scam',
  'Reason: Money laundering'
];

await contract.methods.addToBlocklistBatch(
  addresses,
  reasons
).send({ from: adminAddress });
```

### Removing Addresses from Blocklist

#### Single Address

```javascript
await contract.methods.removeFromBlocklist(
  '0xAddressToUnblock'
).send({ from: adminAddress });
```

#### Multiple Addresses (Batch)

```javascript
const addressesToUnblock = [
  '0xAddress1',
  '0xAddress2'
];

await contract.methods.removeFromBlocklistBatch(
  addressesToUnblock
).send({ from: adminAddress });
```

### Checking Blocklist Status

#### Check if Address is Blocklisted

```javascript
const isBlocked = await contract.methods.isBlocklisted('0xAddressToCheck').call();
console.log('Is blocklisted:', isBlocked);
```

#### Get Detailed Blocklist Information

```javascript
const info = await contract.methods.getBlocklistInfo('0xAddressToCheck').call();
console.log('Is blocked:', info.isBlocked);
console.log('Timestamp:', info.timestamp);
console.log('Reason:', info.reason);
```

#### Get All Blocklisted Addresses

```javascript
const allBlocklisted = await contract.methods.getAllBlocklisted().call();
console.log('Blocklisted addresses:', allBlocklisted);
```

#### Get Blocklisted Addresses with Pagination

```javascript
const offset = 0;
const limit = 50;
const blocklisted = await contract.methods.getBlocklistedPaginated(offset, limit).call();
console.log('Blocklisted addresses (page 1):', blocklisted);
```

#### Get Blocklist Count

```javascript
const count = await contract.methods.getBlocklistCount().call();
console.log('Total blocklisted addresses:', count);
```

## Transaction Behavior

### When a Blocklisted Address Tries to Send a Transaction

```
Error: sender address is blocklisted
```

The transaction will be rejected immediately, and no gas will be consumed.

### When Someone Tries to Send to a Blocklisted Address

```
Error: recipient address is blocklisted
```

The transaction will be rejected immediately, and no gas will be consumed.

## Administrative Functions

### Enable/Disable Blocklist Checking

The blocklist checker can be enabled or disabled programmatically:

```go
import "github.com/ethereum/go-ethereum/core"

// Disable blocklist checking
checker := core.GetBlocklistChecker()
checker.SetEnabled(false)

// Enable blocklist checking
checker.SetEnabled(true)
```

### Emergency Clear Blocklist

In extreme circumstances, the entire blocklist can be cleared:

```javascript
await contract.methods.clearBlocklist().send({ from: adminAddress });
```

**⚠️ Warning**: This function should only be used in emergency situations as it removes all blocklisted addresses at once.

## Security Considerations

### Access Control

- Only addresses with admin privileges can add or remove addresses from the blocklist
- The contract inherits from `Params.sol` which provides the `onlyAdmin` modifier
- Ensure admin keys are properly secured

### Gas Limits

- Batch operations are limited to 100 addresses to prevent gas limit issues
- For larger operations, split into multiple transactions

### Contract Initialization

- The contract must be initialized before use
- Only one initialization is allowed (protected by `onlyNotInitialized` modifier)

### Transparency

- All blocklist operations emit events
- Events can be monitored for transparency and auditing
- Reasons for blocklisting are stored on-chain

## Events

### WalletBlocklisted

```solidity
event WalletBlocklisted(address indexed wallet, string reason, uint256 timestamp);
```

Emitted when an address is added to the blocklist.

### WalletUnblocklisted

```solidity
event WalletUnblocklisted(address indexed wallet, uint256 timestamp);
```

Emitted when an address is removed from the blocklist.

### BlocklistCleared

```solidity
event BlocklistCleared(uint256 timestamp);
```

Emitted when the entire blocklist is cleared.

## Monitoring and Auditing

### Listen to Blocklist Events

```javascript
contract.events.WalletBlocklisted({
  fromBlock: 'latest'
})
.on('data', (event) => {
  console.log('Address blocklisted:', event.returnValues.wallet);
  console.log('Reason:', event.returnValues.reason);
  console.log('Timestamp:', event.returnValues.timestamp);
});

contract.events.WalletUnblocklisted({
  fromBlock: 'latest'
})
.on('data', (event) => {
  console.log('Address unblocklisted:', event.returnValues.wallet);
  console.log('Timestamp:', event.returnValues.timestamp);
});
```

### Query Historical Events

```javascript
const events = await contract.getPastEvents('WalletBlocklisted', {
  fromBlock: 0,
  toBlock: 'latest'
});

events.forEach(event => {
  console.log('Blocklisted:', event.returnValues.wallet);
  console.log('Reason:', event.returnValues.reason);
});
```

## Integration with Existing Systems

### RPC API Integration

You can check blocklist status via standard Ethereum RPC calls:

```bash
# Check if address is blocklisted
curl -X POST --data '{
  "jsonrpc":"2.0",
  "method":"eth_call",
  "params":[{
    "to": "0x0000000000000000000000000000000000001007",
    "data": "0xfe575a87000000000000000000000000<address_to_check>"
  }, "latest"],
  "id":1
}' http://localhost:8545
```

### Web3 Integration Example

```javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const WalletBlocklistABI = [/* ABI here */];
const contractAddress = '0x0000000000000000000000000000000000001007';
const contract = new web3.eth.Contract(WalletBlocklistABI, contractAddress);

// Check before sending transaction
async function sendSafeTransaction(from, to, value) {
  const isFromBlocked = await contract.methods.isBlocklisted(from).call();
  const isToBlocked = await contract.methods.isBlocklisted(to).call();
  
  if (isFromBlocked) {
    throw new Error('Sender address is blocklisted');
  }
  
  if (isToBlocked) {
    throw new Error('Recipient address is blocklisted');
  }
  
  // Proceed with transaction
  return web3.eth.sendTransaction({ from, to, value });
}
```

## Best Practices

1. **Document Reasons**: Always provide clear reasons when blocklisting addresses
2. **Regular Audits**: Periodically review the blocklist to ensure it's up to date
3. **Transparent Communication**: Inform users about blocklist policies
4. **Secure Admin Keys**: Protect admin private keys with hardware wallets or multi-sig
5. **Monitor Events**: Set up monitoring for blocklist events
6. **Test Thoroughly**: Test blocklist functionality on testnet before mainnet deployment
7. **Batch Operations**: Use batch functions for efficiency when managing multiple addresses
8. **Backup Blocklist**: Regularly export and backup the blocklist data

## Troubleshooting

### Contract Not Responding

- Verify the contract is deployed at the correct address
- Check if the contract has been initialized
- Ensure you're using the correct network

### Transactions Still Going Through

- Verify blocklist checking is enabled: `checker.IsEnabled()`
- Check if the contract address is correct
- Ensure the node has been restarted after configuration changes

### Gas Estimation Failures

- Reduce batch size if processing too many addresses
- Check if admin address has sufficient balance for gas

## Example Scripts

### Complete Admin Script

```javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const WalletBlocklistABI = [/* ABI here */];
const contractAddress = '0x0000000000000000000000000000000000001007';
const contract = new web3.eth.Contract(WalletBlocklistABI, contractAddress);
const adminAddress = '0xYourAdminAddress';

// Add address to blocklist
async function blockAddress(address, reason) {
  try {
    const receipt = await contract.methods.addToBlocklist(address, reason)
      .send({ from: adminAddress, gas: 200000 });
    console.log('Address blocked successfully:', receipt.transactionHash);
  } catch (error) {
    console.error('Error blocking address:', error);
  }
}

// Remove address from blocklist
async function unblockAddress(address) {
  try {
    const receipt = await contract.methods.removeFromBlocklist(address)
      .send({ from: adminAddress, gas: 200000 });
    console.log('Address unblocked successfully:', receipt.transactionHash);
  } catch (error) {
    console.error('Error unblocking address:', error);
  }
}

// Get blocklist report
async function getBlocklistReport() {
  const count = await contract.methods.getBlocklistCount().call();
  console.log(`Total blocklisted addresses: ${count}`);
  
  if (count > 0) {
    const addresses = await contract.methods.getAllBlocklisted().call();
    
    for (const addr of addresses) {
      const info = await contract.methods.getBlocklistInfo(addr).call();
      console.log(`\nAddress: ${addr}`);
      console.log(`Reason: ${info.reason}`);
      console.log(`Timestamp: ${new Date(info.timestamp * 1000).toISOString()}`);
    }
  }
}

// Run report
getBlocklistReport();
```

## Support and Maintenance

For issues or questions regarding the wallet blocklist feature:

1. Check this documentation first
2. Review the smart contract code in `System-Contracts/contracts/WalletBlocklist.sol`
3. Review the Go implementation in `Core-Blockchain/node_src/core/wallet_blocklist.go`
4. Check the blockchain logs for error messages
5. Open an issue on the project repository

## Version History

- **v1.0.0** (2024): Initial implementation of wallet blocklist feature
  - Smart contract for managing blocklisted addresses
  - Go integration for transaction validation
  - Batch operations support
  - Event logging and monitoring
