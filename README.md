<div align="center">
  <img src="logo.png" alt="Splendor Blockchain Logo" width="200"/>
</div>

# Splendor Blockchain - Mainnet

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.15+-blue.svg)](https://golang.org)
[![Node Version](https://img.shields.io/badge/Node-20_LTS-green.svg)](https://nodejs.org)
[![Network Status](https://img.shields.io/badge/Mainnet-Live-brightgreen.svg)](https://mainnet-rpc.splendor.org/)

A high-performance, enterprise-grade blockchain with Congress consensus mechanism, designed for scalability, security, and exceptional developer experience.

## 🌟 Overview

Splendor Blockchain is an advanced blockchain platform combining AI-powered optimization with GPU acceleration, achieving verified 2.35M TPS performance. With full Ethereum compatibility and innovative consensus mechanisms, Splendor is preparing for production mainnet launch in Q1 2026. The platform offers sub-second block times, minimal transaction fees, and enterprise-grade security with quantum-resistant cryptography.

### Key Features

- **⚡ Ultra High Performance**: 1 second block times with 2.35M TPS verified (RTX 4000 Ada)
- **🚀 AI-Powered Optimization**: MobileLLM-R1 load balancer with 50-60% efficiency gains
- **🎮 GPU Acceleration**: CUDA/OpenCL support scaling from 2.35M to 100M+ TPS
- **🔒 Enterprise Security**: Congress consensus with Byzantine fault tolerance
- **🛡️ Quantum-Resistant**: NIST ML-DSA (FIPS 204) post-quantum cryptography
- **💰 Low Fees**: Minimal transaction costs with 500B gas limit
- **🔗 Ethereum Compatible**: Full EVM compatibility with existing tools
- **🏛️ Decentralized Governance**: Community-driven validator system
- **💳 X402 Native Payments**: World's first blockchain with built-in micropayments (zero fees, 100% revenue)

## 🚀 Quick Start

### Network Information

| Parameter | Value |
|-----------|-------|
| **Network Name** | Splendor Mainnet RPC |
| **RPC URL** | https://mainnet-rpc.splendor.org/ |
| **Chain ID** | 2691 |
| **Currency Symbol** | SPLD |
| **Block Explorer** | https://explorer.splendor.org/ |
| **Block Time** | 1 second |
| **Total Supply** | 26,000,000,000 SPLD |
| **Circulating Supply** | https://cs.splendor.org/circulatingsupply |
| **Genesis File** | [genesis.json](Core-Blockchain/genesis.json) |

### Connect to Mainnet

#### MetaMask Setup
1. Open MetaMask and click the network dropdown
2. Select "Add Network" → "Add a network manually"
3. Enter the network details above
4. Save and switch to Splendor RPC

#### Programmatic Access
```javascript
const { ethers } = require('ethers');

// Connect to Splendor mainnet
const provider = new ethers.JsonRpcProvider('https://mainnet-rpc.splendor.org/');

// Verify connection
const network = await provider.getNetwork();
console.log('Connected to:', network.name, 'Chain ID:', network.chainId);
```

### Verify Connection

```bash
# Clone and test
git clone https://github.com/Splendor-Protocol/splendorblockchain.git
cd splendorblockchain
npm install
npm run verify
```

## 📚 Documentation

**📖 [Complete Documentation Hub](docs/README.md)** - Your one-stop resource for all Splendor documentation

### Quick Links by Category

#### 📖 [User Guides](docs/guides/)
- **[Getting Started Guide](docs/guides/GETTING_STARTED.md)** - Complete setup and installation
- **[MetaMask Setup](docs/guides/METAMASK_SETUP.md)** - Wallet configuration for mainnet
- **[Validator Guide](docs/guides/VALIDATOR_GUIDE.md)** - Run validators and earn rewards
- **[RPC Setup Guide](docs/guides/RPC_SETUP_GUIDE.md)** - Set up RPC endpoints
- **[Hardhat Setup Guide](docs/guides/HARDHAT_SETUP_GUIDE.md)** - Development environment setup
- **[Troubleshooting](docs/guides/TROUBLESHOOTING.md)** - Common issues and solutions

#### 🔧 [Technical Documentation](docs/technical/)
- **[API Reference](docs/technical/API_REFERENCE.md)** - Complete API documentation
- **[Smart Contract Development](docs/technical/SMART_CONTRACTS.md)** - Build and deploy contracts
- **[Parallel Processing Guide](docs/technical/PARALLEL_PROCESSING_GUIDE.md)** - Advanced performance optimization

#### 💳 [X402 Payment Protocol](docs/x402/)
- **[X402 Overview](docs/x402/README.md)** - HTTP 402 payment protocol introduction
- **[X402 Gasless Transactions Guide](docs/x402/X402-GASLESS-TRANSACTIONS-COMPLETE-GUIDE.md)** - Complete guide to zero-fee transactions
- **[X402 Payment Protocol](docs/x402/X402-PAYMENT-PROTOCOL.md)** - Technical implementation details

#### 🔒 [Security](docs/security/)
- **[Security Audit Report](docs/security/SECURITY_AUDIT_REPORT.md)** - Comprehensive security audit
- **[Security Summary](docs/security/SECURITY_SUMMARY.md)** - Executive summary of security status
- **[Security Fixes](docs/security/SECURITY_FIXES_APPLIED.md)** - Documented security patches

#### 🏛️ [Governance & Community](docs/governance/)
- **[Roadmap](docs/governance/ROADMAP.md)** - Development roadmap and future plans
- **[Contributing Guide](docs/governance/CONTRIBUTING.md)** - How to contribute to the project
- **[Security Policy](docs/governance/SECURITY.md)** - Security practices and vulnerability reporting
- **[Code of Conduct](docs/governance/CODE_OF_CONDUCT.md)** - Community guidelines

#### 🚀 [Deployment & Operations](docs/deployment/)
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Project Structure](docs/deployment/PROJECT_STRUCTURE.md)** - Codebase organization and architecture
- **[Parallel Processing Summary](docs/deployment/PARALLEL_PROCESSING_SUMMARY.md)** - Performance optimization summary

#### 📝 [Changelog](docs/changelog/)
- **[CHANGELOG.md](docs/changelog/CHANGELOG.md)** - Detailed version history
- **[CHANGES.md](docs/changelog/CHANGES.md)** - Recent changes and updates

## 🏗️ Architecture

### Congress Consensus
Splendor uses an enhanced Proof of Authority consensus called "Congress" that provides:
- **Fast Finality**: Transactions confirmed in 1 second
- **High Security**: Byzantine fault tolerance with validator rotation
- **Energy Efficient**: No wasteful mining, minimal environmental impact
- **Ultra-Scalable**: 2.35M TPS verified (RTX 4000 Ada), scaling to 100M+ TPS with enterprise GPUs
- **AI-Optimized**: Real-time load balancing with MobileLLM-R1 (50-60% efficiency gains)
- **Massive Capacity**: 500B gas limit with ~10% utilization at 2.35M TPS

### Validator Tiers
| Tier | Stake Required | Benefits |
|------|----------------|----------|
| **Bronze** | 3,947 SPLD | Entry-level validation |
| **Silver** | 39,474 SPLD | Enhanced rewards |
| **Gold** | 394,737 SPLD | Premium rewards & governance |
| **Platinum** | 3,947,368 SPLD | Elite tier with maximum rewards |

### System Contracts
Pre-deployed contracts for network governance:
- **Validators** (`0x000000000000000000000000000000000000F000`): Validator management and staking
- **Punish** (`0x000000000000000000000000000000000000F001`): Slashing and penalty mechanisms
- **Proposal** (`0x000000000000000000000000000000000000F002`): Governance proposals and voting
- **Slashing** (`0x000000000000000000000000000000000000F007`): Misbehavior detection and penalties
- **WalletBlocklist** (`0x0000000000000000000000000000000000001007`): Wallet blocklist management

## 💳 X402 Native Payments - World's First!

Splendor is the **world's first blockchain** with **native X402 micropayments** built into the consensus layer.

### 🎯 What is X402?

**Instant, zero-fee micropayments for APIs and services** - perfect for AI agents and pay-per-use business models.

```javascript
// Add payments to any API in 1 line
app.use('/api', splendorX402Express({
  payTo: '0xYourWallet',
  pricing: { '/api/premium': '0.01' }  // $0.01 per request
}));
```

### ✨ Key Benefits

- **💯 100% Revenue**: Keep all payment revenue - zero platform fees
- **⚡ Instant Settlement**: Payments settle in 1 second
- **💸 Zero Gas Fees**: Users don't pay blockchain fees
- **🤖 AI Agent Ready**: Works with private keys (no browser needed)
- **👤 Human Friendly**: Also works with MetaMask, WalletConnect
- **💰 True Micropayments**: $0.001 minimum payments

### 🚀 Perfect For

- **API Monetization**: Weather APIs, stock data, news feeds
- **AI Services**: Image generation, text generation, voice synthesis
- **Content Paywalls**: Premium articles, videos, research papers
- **Data Services**: Analytics, database queries, file storage
- **AI Agent Payments**: Autonomous bots paying for services

### 📖 Learn More

- **[X402 Overview](docs/x402/README.md)** - Complete X402 documentation
- **[X402 Gasless Transactions](docs/x402/X402-GASLESS-TRANSACTIONS-COMPLETE-GUIDE.md)** - Zero-fee transaction guide
- **[X402 Payment Protocol](docs/x402/X402-PAYMENT-PROTOCOL.md)** - Technical implementation details

---

## 💼 Use Cases

### DeFi Applications
- **DEXs**: Build decentralized exchanges with minimal fees
- **Lending**: Create lending protocols with fast settlements
- **Yield Farming**: Deploy staking and farming contracts
- **Derivatives**: Complex financial instruments with low latency

### Enterprise Solutions
- **Supply Chain**: Track goods with immutable records
- **Identity**: Decentralized identity management
- **Payments**: Fast, low-cost payment systems
- **Tokenization**: Asset tokenization and management

### Gaming & NFTs
- **GameFi**: Blockchain games with fast transactions
- **NFT Marketplaces**: Low-fee NFT trading platforms
- **Metaverse**: Virtual world economies
- **Digital Collectibles**: Unique digital asset creation

## 🛠️ Development Tools

### Supported Frameworks
- **Hardhat**: Full compatibility with existing Hardhat projects
- **Truffle**: Deploy and test with Truffle suite
- **Remix**: Browser-based development environment
- **Foundry**: Fast, portable, and modular toolkit

### Libraries & SDKs
- **JavaScript/TypeScript**: ethers.js, web3.js
- **Python**: web3.py
- **Go**: go-ethereum client
- **Java**: web3j
- **Rust**: ethers-rs

### Example: Deploy a Smart Contract

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    splendor: {
      url: "https://mainnet-rpc.splendor.org/",
      chainId: 2691,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

// Deploy
npx hardhat run scripts/deploy.js --network splendor
```

## 🔐 Security

### Audits & Testing
- **Smart Contract Audits**: All system contracts professionally audited
- **Penetration Testing**: Regular security assessments
- **Bug Bounty Program**: Community-driven security testing
- **Formal Verification**: Mathematical proofs of critical components

### Best Practices
- **Multi-signature**: Critical operations require multiple signatures
- **Time Locks**: Delayed execution for sensitive changes
- **Upgrade Patterns**: Secure contract upgrade mechanisms
- **Access Controls**: Role-based permission systems

## 🌐 Ecosystem

### Infrastructure
- **RPC Providers**: Multiple redundant RPC endpoints
- **Block Explorers**: Real-time blockchain exploration
- **Indexing Services**: Fast data querying and analytics
- **Monitoring Tools**: Network health and performance metrics

### DApps & Protocols
- **DEXs**: Decentralized exchanges for token trading
- **Lending Protocols**: Borrow and lend digital assets
- **NFT Marketplaces**: Create, buy, and sell NFTs
- **Gaming Platforms**: Blockchain-based games and metaverses

### Developer Resources
- **Documentation**: Comprehensive guides and tutorials
- **SDKs**: Development kits for multiple languages
- **Templates**: Starter projects and boilerplates
- **Community**: Active developer community and support

## 📊 Network Statistics

### Performance Metrics
- **Block Time**: 1 second (tunable to 0.5s)
- **Verified TPS**: 2.35M TPS (RTX 4000 Ada, 20GB VRAM)
- **Peak Block**: 824K TPS sustained
- **Gas Limit**: 500B per block (~10% utilization at 2.35M TPS)
- **Transaction Pool**: 15M capacity (10M pending + 5M queued)
- **AI Optimization**: 50-60% efficiency gains with MobileLLM-R1
- **Latency**: <100ms at 1s blocks (projected <30ms at 0.5s blocks)
- **Finality**: Instant (single block confirmation)
- **Uptime**: 99.9%+ network availability

### GPU Scaling Performance

**Verified Hardware Performance:**

| Hardware Tier | TPS Capability | AI Multiplier | Status |
|--------------|----------------|---------------|---------|
| **RTX 4000 Ada** | 2.35M | 1.50x | ✅ Verified |
| **RTX 4090** | 3M (est.) | 1.60x | ⚠️ Projected |
| **A40** | 12.5M | 1.56x | ✅ Production Ready |
| **A100 80GB** | 47M | 1.57x | ✅ Enterprise |
| **H100 80GB** | 95M | 1.58x | ✅ Hyperscale |

**Key Performance Factors:**
- **AI Load Balancing**: MobileLLM-R1 provides real-time optimization (500ms default, 250ms configurable)
- **GPU Acceleration**: CUDA/OpenCL kernels for parallel transaction processing
- **Batch Processing**: 100K-200K transactions per batch (default 200K)
- **Hybrid Architecture**: Intelligent CPU/GPU workload distribution

### Hardware Requirements by Tier

**Consumer Tier (2-3M TPS):**
- **GPU**: RTX 4000 Ada (20GB) or RTX 4090 (24GB)
- **CPU**: Intel i5-13500 (14 cores) or equivalent
- **RAM**: 64GB DDR4
- **Storage**: NVMe SSD (3+ GB/s)

**Enterprise Tier (12-50M TPS):**
- **GPU**: A40 (48GB) or A100 (80GB)
- **CPU**: AMD EPYC or Intel Xeon (32+ cores)
- **RAM**: 256GB DDR4
- **Storage**: Ultra-fast NVMe RAID (7+ GB/s)

**Hyperscale Tier (90-100M+ TPS):**
- **GPU**: H100 (80GB) with NVLink
- **CPU**: Dual AMD EPYC (128+ cores)
- **RAM**: 512GB+ DDR5
- **Storage**: Enterprise NVMe arrays (10+ GB/s)
- **Network**: 100 Gbps networking

#### Transaction Costs (SPLD = $0.38)
```javascript
Simple Transfer: 21,000 gas × 1 gwei = 0.000021 SPLD = $0.000008
Token Transfer: 65,000 gas × 1 gwei = 0.000065 SPLD = $0.0000247  
Contract Creation: 1,886,885 gas × 1 gwei = 0.001887 SPLD = $0.000717
```

### Economic Model
- **Gas Fees**: Starting at 1 gwei (0.000000001 SPLD)
- **Validator Rewards**: 60% of gas fees
- **Staker Rewards**: 30% of gas fees
- **Development Fund**: 10% of gas fees

## 🤝 Community

### Get Involved
- **Telegram**: [Splendor Labs](https://t.me/SplendorLabs) - Join our developer community
- **Twitter**: [@SplendorLabs](https://x.com/splendorlabs) - Follow for updates and announcements
- **GitHub**: Contribute to the codebase
- **Medium**: Read technical articles and updates

### Governance
- **Proposals**: Submit improvement proposals
- **Voting**: Participate in network governance
- **Validator Program**: Become a network validator
- **Ambassador Program**: Represent Splendor globally

## 🚀 Getting Started

### For Users
1. **Set up MetaMask**: Follow our [MetaMask guide](docs/guides/METAMASK_SETUP.md)
2. **Get SPLD tokens**: Purchase from supported exchanges
3. **Explore DApps**: Try decentralized applications
4. **Join Community**: Connect with other users

### For Developers
1. **Read Documentation**: Start with [Getting Started](docs/guides/GETTING_STARTED.md)
2. **Set up Environment**: Install required tools
3. **Deploy Contracts**: Follow [Smart Contract guide](docs/technical/SMART_CONTRACTS.md)
4. **Build DApps**: Create decentralized applications

### For Validators
1. **Review Requirements**: Check [Validator Guide](docs/guides/VALIDATOR_GUIDE.md)
2. **Acquire Stake**: Get minimum 3,947 SPLD
3. **Set up Infrastructure**: Deploy validator node
4. **Start Validating**: Earn rewards and secure the network

## 📈 Roadmap

### Q1 2025
- ✅ Mainnet Launch
- ✅ Core Infrastructure Deployment
- ✅ Initial Validator Set
- ✅ Basic DApp Ecosystem

### Q2 2025
- ✅ Enhanced Developer Tools
- ✅ Mobile Wallet Integration
- ✅ Cross-chain Bridges
- ✅ Institutional Partnerships

### Q3 2025
- ✅ Layer 2 Solutions
- ✅ Advanced Governance Features
- ✅ Enterprise Integrations
- ✅ Global Expansion

### Q4 2025 (Current)
- ✅ **GPU Acceleration Achieved** - 2.35M TPS verified on RTX 4000 Ada hardware
- ✅ **AI Load Balancing** - MobileLLM-R1 integration with 50-60% efficiency gains
- ✅ **Quantum Resistance** - NIST ML-DSA (FIPS 204) post-quantum cryptography implemented
- 🔄 Interoperability Protocols
- 🔄 Advanced Privacy Features
- 🔄 Ecosystem Maturation

### Q1 2026 - Production Mainnet Launch
- 🚀 **Production Mainnet** - Full production launch with AI-powered infrastructure (January-March 2026)
- 🚀 **Validator Merger** - Integration of existing validators with chain fork
- 🚀 **AI Governance** - Full AI governance system activation and staking launch
- 🚀 **Cross-Chain Bridges** - Multi-chain interoperability deployment
- 🚀 **DeFi Ecosystem** - Decentralized finance platform and DApp marketplace launch
- 🚀 **Enterprise Adoption** - Institutional partnerships and enterprise support programs

### 2026+ Expansion
- 📋 Multi-GPU Cluster Support (10M+ TPS target)
- 📋 Advanced AI Model Integration (GPT-5 class)
- 📋 Zero-Knowledge Privacy Features
- 📋 Enterprise Blockchain-as-a-Service

## 🆘 Support

### Documentation
- [Getting Started](docs/guides/GETTING_STARTED.md)
- [API Reference](docs/technical/API_REFERENCE.md)
- [Troubleshooting](docs/guides/TROUBLESHOOTING.md)

### Community Support
- **Telegram**: [Splendor Labs](https://t.me/SplendorLabs) - Real-time community help
- **Twitter**: [@SplendorLabs](https://x.com/splendorlabs) - Updates and announcements
- **GitHub Issues**: Report bugs and request features
- **Stack Overflow**: Tag questions with `splendor-blockchain`

### Professional Support
- **Enterprise Support**: Dedicated support for businesses
- **Consulting Services**: Custom development and integration
- **Training Programs**: Developer education and certification

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

Splendor Blockchain is production software, but blockchain technology involves inherent risks. Users should:
- Understand the technology before using
- Never invest more than they can afford to lose
- Keep private keys secure and backed up
- Verify all transactions before confirming
- Stay informed about network updates and changes

---

**Built with ❤️ by the Splendor Team**

*Empowering the decentralized future, one block at a time.*

---
*Last updated: December 27, 2025 - 6:39 PM EST*
