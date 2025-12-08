# Genesis Configuration for WalletBlocklist System Contract

## Overview

The WalletBlocklist contract should be deployed as a **system contract** in your genesis.json file, just like the other system contracts (Validators, Punish, Proposal, Slashing). This ensures it's available from block 0.

## System Contract Address

The WalletBlocklist contract is deployed at:
```
0x0000000000000000000000000000000000001007
```

This address is already defined in `Params.sol`:
```solidity
address public constant WalletBlocklistAddr = 0x0000000000000000000000000000000000001007;
```

## Steps to Add to Genesis

### 1. Compile the Contract

First, compile the WalletBlocklist contract to get its bytecode:

```bash
cd System-Contracts
npx hardhat compile
```

The compiled bytecode will be in:
```
System-Contracts/contracts/artifacts/WalletBlocklist.sol/WalletBlocklist.json
```

### 2. Extract the Bytecode

From the compiled JSON file, extract the `bytecode` field (not `deployedBytecode`). It will look like:
```
0x608060405234801561001057600080fd5b50...
```

### 3. Add to genesis.json

Open your `Core-Blockchain/genesis.json` file and add the WalletBlocklist contract to the `alloc` section:

```json
{
  "config": {
    // ... your existing config
  },
  "alloc": {
    // ... your existing allocations
    
    "0x000000000000000000000000000000000000f000": {
      "balance": "0x0",
      "code": "0x..." // Validators contract bytecode
    },
    "0x000000000000000000000000000000000000F001": {
      "balance": "0x0",
      "code": "0x..." // Punish contract bytecode
    },
    "0x000000000000000000000000000000000000F002": {
      "balance": "0x0",
      "code": "0x..." // Proposal contract bytecode
    },
    "0x000000000000000000000000000000000000f007": {
      "balance": "0x0",
      "code": "0x..." // Slashing contract bytecode
    },
    
    // ADD THIS - WalletBlocklist System Contract
    "0x0000000000000000000000000000000000001007": {
      "balance": "0x0",
      "code": "0x<COMPILED_BYTECODE_HERE>"
    }
  }
}
```

### 4. Initialize After Genesis

After the blockchain starts with the genesis block, you need to initialize the WalletBlocklist contract **once**:

```javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const WalletBlocklistABI = [/* ABI from compiled contract */];
const contractAddress = '0x0000000000000000000000000000000000001007';

const contract = new web3.eth.Contract(WalletBlocklistABI, contractAddress);

// Initialize with your admin address
await contract.methods.initialize('0xYourAdminAddress').send({
  from: '0xYourAdminAddress',
  gas: 500000
});

console.log('WalletBlocklist initialized!');
```

## Complete Example

Here's a complete example of what your genesis.json should look like:

```json
{
  "config": {
    "chainId": 1234,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "congress": {
      "period": 3,
      "epoch": 200
    }
  },
  "difficulty": "0x1",
  "gasLimit": "0x47b760",
  "extraData": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "alloc": {
    "0x000000000000000000000000000000000000f000": {
      "balance": "0x0",
      "code": "0x<VALIDATORS_BYTECODE>"
    },
    "0x000000000000000000000000000000000000F001": {
      "balance": "0x0",
      "code": "0x<PUNISH_BYTECODE>"
    },
    "0x000000000000000000000000000000000000F002": {
      "balance": "0x0",
      "code": "0x<PROPOSAL_BYTECODE>"
    },
    "0x000000000000000000000000000000000000f007": {
      "balance": "0x0",
      "code": "0x<SLASHING_BYTECODE>"
    },
    "0x0000000000000000000000000000000000001007": {
      "balance": "0x0",
      "code": "0x<WALLETBLOCKLIST_BYTECODE>"
    },
    "0xYourAdminAddress": {
      "balance": "0x200000000000000000000000000000000000000000000000000000000000000"
    }
  }
}
```

## Initialization Script

Create a script to initialize the contract after genesis:

```javascript
// initialize-blocklist.js
const Web3 = require('web3');
const fs = require('fs');

async function initializeBlocklist() {
  const web3 = new Web3('http://localhost:8545');
  
  // Load ABI from compiled contract
  const contractJson = JSON.parse(
    fs.readFileSync('./System-Contracts/contracts/artifacts/WalletBlocklist.sol/WalletBlocklist.json')
  );
  
  const contract = new web3.eth.Contract(
    contractJson.abi,
    '0x0000000000000000000000000000000000001007'
  );
  
  // Your admin address (should have balance in genesis)
  const adminAddress = '0xYourAdminAddress';
  const adminPrivateKey = 'YOUR_PRIVATE_KEY';
  
  // Add account to web3
  web3.eth.accounts.wallet.add(adminPrivateKey);
  
  // Check if already initialized
  const isInitialized = await contract.methods.initialized().call();
  
  if (isInitialized) {
    console.log('Contract already initialized');
    return;
  }
  
  // Initialize the contract
  console.log('Initializing WalletBlocklist contract...');
  const tx = await contract.methods.initialize(adminAddress).send({
    from: adminAddress,
    gas: 500000
  });
  
  console.log('Initialized! Transaction hash:', tx.transactionHash);
  console.log('Admin address:', adminAddress);
  
  // Verify
  const admin = await contract.methods.admin().call();
  console.log('Contract admin:', admin);
}

initializeBlocklist()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

Run after starting your blockchain:
```bash
node initialize-blocklist.js
```

## Verification

After adding to genesis and initializing, verify the contract is working:

```javascript
const web3 = new Web3('http://localhost:8545');

// Check contract exists
const code = await web3.eth.getCode('0x0000000000000000000000000000000000001007');
console.log('Contract deployed:', code !== '0x');

// Check if initialized
const contract = new web3.eth.Contract(ABI, '0x0000000000000000000000000000000000001007');
const initialized = await contract.methods.initialized().call();
console.log('Contract initialized:', initialized);

// Check admin
const admin = await contract.methods.admin().call();
console.log('Admin address:', admin);
```

## Important Notes

1. **Compile First**: Always compile the contract before extracting bytecode
2. **Use Bytecode, Not DeployedBytecode**: Use the `bytecode` field from the JSON
3. **Initialize Once**: The contract can only be initialized once
4. **Admin Security**: The admin address you specify has full control over the blocklist
5. **System Contract**: This is deployed at genesis, not through a regular transaction

## Troubleshooting

### Contract Not Found
- Verify the address in genesis.json matches `0x0000000000000000000000000000000000001007`
- Ensure you used the correct bytecode (not deployedBytecode)
- Restart the blockchain node after modifying genesis.json

### Initialization Fails
- Check if contract is already initialized
- Verify admin address has sufficient balance for gas
- Ensure you're using the correct network

### Blocklist Not Working
- Verify the contract is initialized
- Check that the Go code is using the correct contract address
- Ensure the blockchain node has been restarted after genesis changes

## Next Steps

After adding to genesis and initializing:

1. **Add backup admins**: `contract.methods.addAdmin('0xBackupAdmin').send(...)`
2. **Test blocklist**: Add a test address and verify transactions are blocked
3. **Monitor events**: Set up event listeners for blocklist changes
4. **Document procedures**: Create internal docs for managing the blocklist

## Summary

✅ **Add to genesis.json** - Deploy as system contract at address `0x0000000000000000000000000000000000001007`  
✅ **Compile contract** - Get bytecode from Hardhat compilation  
✅ **Initialize once** - Set admin address after blockchain starts  
✅ **Verify deployment** - Check contract exists and is initialized  
✅ **Start using** - Add/remove addresses from blocklist as needed  

This approach ensures the WalletBlocklist is available from the very first block, just like all other system contracts!
