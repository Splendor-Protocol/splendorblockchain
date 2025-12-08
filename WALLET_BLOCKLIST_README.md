# Wallet Blocklist Implementation

## Quick Overview

This implementation adds the ability to blocklist/pause wallets from transferring native coins on the Splendor blockchain as a safeguard against bad actors.

## What Was Added

### 1. Smart Contract (`System-Contracts/contracts/WalletBlocklist.sol`)
A comprehensive smart contract that manages blocklisted addresses with the following features:
- Add/remove addresses to/from blocklist (single or batch)
- Query blocklist status
- Store reasons and timestamps for each blocklisted address
- Event logging for transparency
- Pagination support for large blocklists
- Admin-only access control

### 2. Go Implementation (`Core-Blockchain/node_src/core/wallet_blocklist.go`)
A Go module that integrates with the blockchain core to:
- Check if addresses are blocklisted by calling the smart contract
- Validate transactions before they are processed
- Reject transactions from or to blocklisted addresses
- Can be enabled/disabled programmatically

### 3. Error Definitions (`Core-Blockchain/node_src/core/error.go`)
Added two new error types:
- `ErrSenderBlocklisted`: Returned when sender is blocklisted
- `ErrRecipientBlocklisted`: Returned when recipient is blocklisted

### 4. Transaction Validation (`Core-Blockchain/node_src/core/state_transition.go`)
Integrated blocklist checking into the transaction validation flow:
- Checks both sender and recipient addresses
- Rejects transactions early (before gas consumption)
- Works with all transaction types (regular, meta, X402)

### 5. Documentation (`docs/security/WALLET_BLOCKLIST_GUIDE.md`)
Comprehensive guide covering:
- Architecture and features
- Deployment instructions
- Usage examples
- Security considerations
- Troubleshooting
- Best practices

## How It Works

```
Transaction Submitted
        ↓
Check Blocklist (preCheck)
        ↓
    Is sender blocklisted? ──Yes──> Reject (ErrSenderBlocklisted)
        ↓ No
    Is recipient blocklisted? ──Yes──> Reject (ErrRecipientBlocklisted)
        ↓ No
Continue with normal transaction processing
```

## Quick Start

### 1. Deploy the Contract

Add to your genesis.json:
```json
{
  "0x0000000000000000000000000000000000001007": {
    "balance": "0x0",
    "code": "<compiled WalletBlocklist.sol bytecode>"
  }
}
```

### 2. Initialize the Contract

```javascript
const contract = new web3.eth.Contract(ABI, '0x0000000000000000000000000000000000001007');
await contract.methods.initialize().send({ from: adminAddress });
```

### 3. Add Addresses to Blocklist

```javascript
await contract.methods.addToBlocklist(
  '0xBadActorAddress',
  'Reason: Fraudulent activity'
).send({ from: adminAddress });
```

### 4. Check Blocklist Status

```javascript
const isBlocked = await contract.methods.isBlocklisted('0xAddress').call();
```

## Key Features

✅ **Prevents bad actors** from sending native coins  
✅ **Prevents receiving** native coins to blocklisted addresses  
✅ **Batch operations** for managing multiple addresses efficiently  
✅ **Event logging** for transparency and auditing  
✅ **Pagination support** for large blocklists  
✅ **Admin-only access** with secure access control  
✅ **Early rejection** - transactions rejected before gas consumption  
✅ **Can be enabled/disabled** programmatically  
✅ **Comprehensive documentation** with examples  

## Contract Address

**System Contract Address**: `0x0000000000000000000000000000000000001007`

This is a system contract address that should be deployed in your genesis block or as a system contract.

## Security Notes

- Only admin addresses can add/remove from blocklist
- All operations are logged via events
- Reasons for blocklisting are stored on-chain
- Batch operations limited to 100 addresses to prevent gas issues
- Contract must be initialized before use

## Files Modified/Created

### Created:
1. `System-Contracts/contracts/WalletBlocklist.sol` - Smart contract
2. `Core-Blockchain/node_src/core/wallet_blocklist.go` - Go implementation
3. `docs/security/WALLET_BLOCKLIST_GUIDE.md` - Comprehensive guide
4. `WALLET_BLOCKLIST_README.md` - This file

### Modified:
1. `Core-Blockchain/node_src/core/error.go` - Added blocklist errors
2. `Core-Blockchain/node_src/core/state_transition.go` - Integrated blocklist checks

## Testing

Before deploying to mainnet:

1. **Deploy to testnet** and verify contract deployment
2. **Test adding addresses** to blocklist
3. **Test transaction rejection** for blocklisted addresses
4. **Test removing addresses** from blocklist
5. **Test batch operations** with multiple addresses
6. **Test event emission** and monitoring
7. **Test admin access control**
8. **Verify gas consumption** for various operations

## Usage Examples

### Block an Address
```javascript
await contract.methods.addToBlocklist(
  '0xBadActor',
  'Phishing scam'
).send({ from: admin });
```

### Unblock an Address
```javascript
await contract.methods.removeFromBlocklist('0xBadActor').send({ from: admin });
```

### Check if Blocked
```javascript
const blocked = await contract.methods.isBlocklisted('0xAddress').call();
```

### Get All Blocked Addresses
```javascript
const all = await contract.methods.getAllBlocklisted().call();
```

### Batch Block Multiple Addresses
```javascript
await contract.methods.addToBlocklistBatch(
  ['0xAddr1', '0xAddr2', '0xAddr3'],
  ['Reason 1', 'Reason 2', 'Reason 3']
).send({ from: admin });
```

## Transaction Errors

When a transaction is rejected due to blocklist:

**Sender blocklisted:**
```
Error: sender address is blocklisted
```

**Recipient blocklisted:**
```
Error: recipient address is blocklisted
```

## Administrative Control

### Enable/Disable Blocklist Checking (Go)
```go
checker := core.GetBlocklistChecker()
checker.SetEnabled(false) // Disable
checker.SetEnabled(true)  // Enable
```

### Change Contract Address (Go)
```go
core.SetBlocklistContractAddress(common.HexToAddress("0xNewAddress"))
```

## Next Steps

1. **Compile the smart contract** using Hardhat or your preferred tool
2. **Deploy to testnet** for testing
3. **Initialize the contract** with admin address
4. **Test all functionality** thoroughly
5. **Deploy to mainnet** when ready
6. **Set up monitoring** for blocklist events
7. **Document your admin procedures** for managing the blocklist

## Support

For detailed information, see:
- **Full Guide**: `docs/security/WALLET_BLOCKLIST_GUIDE.md`
- **Smart Contract**: `System-Contracts/contracts/WalletBlocklist.sol`
- **Go Implementation**: `Core-Blockchain/node_src/core/wallet_blocklist.go`

## License

This implementation follows the same license as the Splendor Blockchain project (GNU Lesser General Public License v3.0).
