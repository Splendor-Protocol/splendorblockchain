# X402 Payment Protocol (HTTP 402)

⚠️ **NOTE**: This document covers the **X402 Payment Protocol** for monetizing APIs. For **X402 Gasless Transactions** (zero fees for TND token), see [README.md](README.md).

---

## Overview

The **X402 Payment Protocol** implements HTTP 402 "Payment Required" functionality, enabling developers to monetize APIs and services with cryptocurrency micropayments on Splendor Blockchain.

## 🚀 Key Features

- **💰 API Monetization** - Charge for API calls with signed cryptocurrency payments
- **🔐 Cryptographic Signatures** - Secure payment verification without intermediaries
- **⚡ Instant Settlement** - Payments settled directly on-chain
- **🌐 Standard Compliant** - Based on HTTP 402 Payment Required standard
- **🔄 EIP-2612 Support** - Gasless token approvals via permits
- **📡 RPC Integration** - Full JSON-RPC API for easy integration

## 🎯 How It Works

### **Payment Flow:**

```
1. Client requests protected resource
   ↓
2. Server returns 402 Payment Required with requirements
   ↓
3. Client signs payment with private key
   ↓
4. Client sends signed payment to server
   ↓
5. Server verifies payment (x402_verify)
   ↓
6. Server settles payment on-chain (x402_settle)
   ↓
7. Server grants access to resource
```

## 📡 RPC API Methods

### **x402_supported**
Check if X402 payment protocol is available.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "x402_supported",
  "params": [],
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "supported": true,
    "schemes": ["native", "eip2612"],
    "networks": ["splendor-mainnet"]
  }
}
```

### **x402_verify**
Verify a signed payment without executing it.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "x402_verify",
  "params": [
    {
      "scheme": "native",
      "asset": "0x8e519737d890df040b027b292C9aD2c321bC64dD",
      "amount": "1000000000000000000"
    },
    {
      "x402Version": 2,
      "network": "splendor-mainnet",
      "scheme": "native",
      "payload": {
        "from": "0xSenderAddress",
        "to": "0xReceiverAddress",
        "asset": "0x8e519737d890df040b027b292C9aD2c321bC64dD",
        "value": "1000000000000000000",
        "validAfter": 1234567890,
        "validBefore": 1234567890,
        "nonce": "0x...",
        "signature": "0x..."
      }
    }
  ],
  "id": 2
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "valid": true,
    "reason": ""
  }
}
```

### **x402_settle**
Execute a verified payment on-chain.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "x402_settle",
  "params": [
    {
      "scheme": "native",
      "asset": "0x8e519737d890df040b027b292C9aD2c321bC64dD",
      "amount": "1000000000000000000"
    },
    {
      "x402Version": 2,
      "network": "splendor-mainnet",
      "scheme": "native",
      "payload": {
        "from": "0xSenderAddress",
        "to": "0xReceiverAddress",
        "asset": "0x8e519737d890df040b027b292C9aD2c321bC64dD",
        "value": "1000000000000000000",
        "validAfter": 1234567890,
        "validBefore": 1234567890,
        "nonce": "0x...",
        "signature": "0x..."
      }
    }
  ],
  "id": 3
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "success": true,
    "txHash": "0x...",
    "error": ""
  }
}
```

## 🔧 Implementation Details

### **Files:**
- `Core-Blockchain/node_src/eth/api_x402.go` - Main API implementation
- `Core-Blockchain/node_src/eth/handler_x402_fix.go` - Transaction broadcasting
- `Core-Blockchain/node_src/core/types/x402_tx.go` - Transaction type definition

### **Transaction Type:**
- **Type ID**: `0x50` (EIP-2718 typed transaction)
- **Purpose**: System transactions for payment settlement
- **Characteristics**: Created programmatically by RPC, not by users directly

### **Payment Signature:**
Payments are signed using EIP-191 or EIP-712 standards:

```javascript
// Message format (v2 with chainId)
const message = `x402-payment:${from}:${to}:${value}:${validAfter}:${validBefore}:${nonce}:${asset}:${chainId}`;

// Sign with EIP-191 prefix
const signature = await signer.signMessage(message);
```

## 💳 Payment Schemes

### **Native Scheme**
Direct token transfers using standard ERC-20 transfers.

**Requirements:**
- Token balance in sender account
- Token approval to receiver or contract

### **EIP-2612 Permit Scheme**
Gasless token approvals using EIP-2612 permits.

**Requirements:**
- Token must implement EIP-2612 `permit()` function
- Valid permit signature

**Advantages:**
- No separate approval transaction needed
- Lower gas costs
- Better UX for payment recipients

## 🔒 Security Features

### **Signature Verification**
- **Strict Mode**: Only canonical signatures accepted in production
- **Replay Protection**: Nonce-based to prevent replay attacks
- **Time-Bounded**: ValidAfter and ValidBefore timestamps
- **Chain-Specific**: Includes chainId to prevent cross-chain replay

### **Payment Validation**
- **Balance Checks**: Verifies sufficient funds before settlement
- **Allowance Checks**: Verifies token approvals
- **Nonce Registry**: Tracks used nonces to prevent double-spending
- **EOA Verification**: Ensures sender is externally owned account

## 📊 Use Cases

### **API Monetization**
```javascript
// Server endpoint
app.get('/premium-api', async (req, res) => {
  const payment = req.headers['x-payment'];
  
  // Verify payment
  const verification = await rpc.call('x402_verify', [requirements, payment]);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Payment Required',
      requirements: requirements
    });
  }
  
  // Settle payment
  await rpc.call('x402_settle', [requirements, payment]);
  
  // Return premium data
  res.json({ data: premiumData });
});
```

### **Micro-Services**
- **Per-Request Pricing**: Charge for each API call
- **Usage-Based Billing**: Track and charge based on resource consumption
- **Tiered Access**: Different pricing for different service levels

### **Content Monetization**
- **Pay-Per-View**: Charge for accessing premium content
- **Subscription Services**: Time-based access with recurring payments
- **Digital Downloads**: One-time payments for downloadable content

## 🚀 Getting Started

### **Server Setup**

1. **Connect to Splendor RPC**
```javascript
const Web3 = require('web3');
const web3 = new Web3('https://mainnet-rpc.splendor.org/');
```

2. **Check X402 Support**
```javascript
const supported = await web3.eth.call({
  to: null,
  data: web3.utils.toHex('x402_supported')
});
```

3. **Define Payment Requirements**
```javascript
const requirements = {
  scheme: 'native',
  asset: '0x8e519737d890df040b027b292C9aD2c321bC64dD', // TND Token
  amount: web3.utils.toWei('1', 'ether')
};
```

### **Client Setup**

1. **Request Resource**
```javascript
const response = await fetch('https://api.example.com/premium-api');
if (response.status === 402) {
  const { requirements } = await response.json();
  // Proceed with payment
}
```

2. **Sign Payment**
```javascript
const payload = {
  from: myAddress,
  to: requirements.receiver,
  asset: requirements.asset,
  value: requirements.amount,
  validAfter: Math.floor(Date.now() / 1000),
  validBefore: Math.floor(Date.now() / 1000) + 3600,
  nonce: generateNonce(),
  chainId: 2691
};

const message = formatPaymentMessage(payload);
const signature = await signer.signMessage(message);
payload.signature = signature;
```

3. **Submit Payment**
```javascript
const response = await fetch('https://api.example.com/premium-api', {
  headers: {
    'X-Payment': JSON.stringify({ x402Version: 2, network: 'splendor-mainnet', scheme: 'native', payload })
  }
});
```

## 🔍 Monitoring

### **Track Payments**
```bash
# Monitor X402 settlement transactions
tail -f chaindata/geth.log | grep "X402: Settling payment"
```

### **Payment Analytics**
- Total payments processed
- Average payment amount
- Payment success rate
- Popular payment assets

## ⚠️ Important Notes

### **Difference from Gasless Transactions**
- **X402 Payment Protocol**: For API monetization (this document)
- **X402 Gasless**: For zero-fee TND transactions (see [README.md](README.md))
- Both use "X402" name but serve different purposes

### **Transaction Broadcasting**
The X402 Payment Protocol creates special system transactions that:
- Are created by the RPC server, not end users
- Use the X402 broadcast manager for proper propagation
- Settle payments on-chain with proper consensus validation

### **Production Deployment**
Ensure your RPC node is updated with:
1. Latest X402 API implementation
2. X402 broadcast manager
3. Proper transaction pooling

See [DEPLOYMENT_REQUIRED.md](../deployment/DEPLOYMENT_REQUIRED.md) for deployment details.

## 📚 Technical Specifications

### **Protocol Version**
- Current Version: 2
- Signature Format: EIP-191 or EIP-712
- Chain ID: 2691 (Splendor Mainnet)

### **Nonce Format**
- 32-byte random value
- Must be unique per payment
- Tracked in on-chain registry

### **Timestamp Validation**
- ValidAfter: Payment not accepted before this timestamp
- ValidBefore: Payment not accepted after this timestamp
- Recommended window: 1 hour

## 🛠️ Development Tools

### **Testing**
```javascript
// Test payment verification
const result = await web3.eth.call({
  to: null,
  data: encodeX402Verify(requirements, payload)
});
```

### **Debugging**
```bash
# Enable X402 debug logging
export X402_STRICT_VERIFY=0  # Disable for development
export X402_DEBUG=1           # Enable verbose logging
```

## 🎯 Roadmap

- [ ] Multi-signature payment support
- [ ] Batch payment processing
- [ ] Payment channels for high-frequency micropayments
- [ ] Subscription management SDK
- [ ] Payment analytics dashboard

---

**The X402 Payment Protocol brings HTTP 402 functionality to Splendor Blockchain, enabling true API monetization with cryptocurrency!**

For questions or support, join our [Telegram](https://t.me/SplendorLabs) or open an issue on [GitHub](https://github.com/Splendor-Protocol/splendor-blockchain-v4).
