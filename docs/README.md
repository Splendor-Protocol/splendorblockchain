# Splendor Blockchain V4 Documentation Hub

Welcome to the comprehensive documentation for Splendor Blockchain V4. This documentation covers everything you need to know about using, developing on, and contributing to the Splendor ecosystem.

## 📁 Documentation Structure

Our documentation is organized into seven main categories for easy navigation:

### 📖 [Guides](guides/) - Getting Started & How-To Guides
Perfect for newcomers and users looking for step-by-step instructions.

- **[Getting Started Guide](guides/GETTING_STARTED.md)** - Complete setup guide for new users
- **[MetaMask Setup](guides/METAMASK_SETUP.md)** - Configure MetaMask for Splendor network
- **[Validator Guide](guides/VALIDATOR_GUIDE.md)** - Complete guide for running a validator node
- **[RPC Setup Guide](guides/RPC_SETUP_GUIDE.md)** - Complete guide for setting up RPC endpoints
- **[Hardhat Setup Guide](guides/HARDHAT_SETUP_GUIDE.md)** - Development environment setup
- **[Troubleshooting](guides/TROUBLESHOOTING.md)** - Common issues and solutions

### 🔧 [Technical](technical/) - Developer Documentation
In-depth technical documentation for developers building on Splendor.

- **[API Reference](technical/API_REFERENCE.md)** - Complete JSON-RPC API documentation
- **[Smart Contracts](technical/SMART_CONTRACTS.md)** - System contracts and deployment guide
- **[Parallel Processing Guide](technical/PARALLEL_PROCESSING_GUIDE.md)** - Advanced performance optimization

### 💳 [X402 Features](x402/) - Two Distinct Systems

Splendor Blockchain includes two separate X402 systems serving different purposes:

#### **X402 Gasless Transactions** - Zero Gas Fees for TND Token
- **[Gasless Guide](x402/README.md)** - Enable zero gas fee transactions for TND token
- **[Technical Details](x402/X402-GASLESS-TRANSACTIONS-COMPLETE-GUIDE.md)** - Complete implementation guide
- **Purpose**: Remove gas fees for TND token transactions
- **How it works**: Add "x402" metadata (0x78343032) to transaction data

#### **X402 Payment Protocol** - HTTP 402 API Monetization  
- **[Payment Protocol Guide](x402/X402-PAYMENT-PROTOCOL.md)** - Monetize APIs with cryptocurrency
- **Purpose**: Enable<br>API monetization with signed cryptocurrency payments
- **How it works**: Use `x402_verify` and `x402_settle` RPC methods
- **Based on**: HTTP 402 Payment Required standard

### 🔒 [Security](security/) - Security Audits & Reports
Security documentation, audit reports, and vulnerability fixes.

- **[Security Audit Report](security/SECURITY_AUDIT_REPORT.md)** - Comprehensive security audit
- **[Security Summary](security/SECURITY_SUMMARY.md)** - Executive summary of security status
- **[Security Fixes Applied](security/SECURITY_FIXES_APPLIED.md)** - Documented security patches

### 🏛️ [Governance](governance/) - Community & Project Management
Information about project governance, community guidelines, and development roadmap.

- **[Roadmap](governance/ROADMAP.md)** - Development roadmap and future plans
- **[Contributing](governance/CONTRIBUTING.md)** - How to contribute to the project
- **[Code of Conduct](governance/CODE_OF_CONDUCT.md)** - Community guidelines
- **[Security Policy](governance/SECURITY.md)** - Security practices and vulnerability reporting

### 🚀 [Deployment](deployment/) - Infrastructure & Operations
Deployment guides, infrastructure setup, and operational documentation.

- **[Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Deployment Required](deployment/DEPLOYMENT_REQUIRED.md)** - Required deployment steps
- **[Parallel Processing Summary](deployment/PARALLEL_PROCESSING_SUMMARY.md)** - Performance optimization summary
- **[Project Structure](deployment/PROJECT_STRUCTURE.md)** - Codebase organization and architecture

### 📝 [Changelog](changelog/) - Version History
Track changes, updates, and version history.

- **[CHANGELOG.md](changelog/CHANGELOG.md)** - Detailed version history
- **[CHANGES.md](changelog/CHANGES.md)** - Recent changes and updates

## 🚀 Quick Navigation

### 👤 For Users
- [Connect to Splendor Network](guides/METAMASK_SETUP.md#adding-splendor-network)
- [Transfer SPLD Tokens](guides/GETTING_STARTED.md#transferring-tokens)
- [Common Issues](guides/TROUBLESHOOTING.md#common-user-issues)

### 👨‍💻 For Developers
- [Development Setup](governance/CONTRIBUTING.md#development-setup)
- [API Endpoints](technical/API_REFERENCE.md#endpoints)
- [Smart Contract Integration](technical/SMART_CONTRACTS.md#integration-guide)
- [X402 Gasless TND](x402/README.md) | [X402 Payment Protocol](x402/X402-PAYMENT-PROTOCOL.md)
- [Testing Framework](governance/CONTRIBUTING.md#testing-guidelines)

### 🏗️ For Validators
- [Validator Requirements](guides/VALIDATOR_GUIDE.md#requirements)
- [Node Setup](guides/VALIDATOR_GUIDE.md#node-setup)
- [Staking Process](guides/VALIDATOR_GUIDE.md#staking)
- [Monitoring](guides/VALIDATOR_GUIDE.md#monitoring)

### 🌐 For RPC Operators
- [RPC Requirements](guides/RPC_SETUP_GUIDE.md#prerequisites)
- [Quick Setup](guides/RPC_SETUP_GUIDE.md#quick-setup)
- [Configuration](guides/RPC_SETUP_GUIDE.md#rpc-configuration)
- [Load Balancing](guides/RPC_SETUP_GUIDE.md#load-balancing)

### 🤝 For Contributors
- [How to Contribute](governance/CONTRIBUTING.md#how-to-contribute)
- [Coding Standards](governance/CONTRIBUTING.md#coding-standards)
- [Pull Request Process](governance/CONTRIBUTING.md#pull-request-process)
- [Security Guidelines](governance/CONTRIBUTING.md#security-guidelines)

## 🔗 External Resources

### Official Links
- **Website**: [https://splendor.org](https://splendor.org)
- **GitHub**: [https://github.com/Splendor-Protocol/splendor-blockchain-v4](https://github.com/Splendor-Protocol/splendor-blockchain-v4)
- **Explorer**: [https://explorer.splendor.org](https://explorer.splendor.org)
- **Mainnet RPC**: [https://mainnet-rpc.splendor.org/](https://mainnet-rpc.splendor.org/)

### Community
- **Telegram**: [Splendor Labs](https://t.me/SplendorLabs) - Real-time community support
- **Twitter**: [@SplendorLabs](https://x.com/splendorlabs) - Updates and announcements

### Developer Resources
- **SDK**: [JavaScript/TypeScript SDK](https://www.npmjs.com/package/@splendor/sdk)
- **Tools**: [Developer Tools Repository](https://github.com/Splendor-Protocol/developer-tools)
- **Examples**: [Code Examples](https://github.com/Splendor-Protocol/examples)

## 📖 Documentation Categories

### 🏁 Getting Started
Perfect for newcomers to Splendor Blockchain. Learn the basics, set up your wallet, and make your first transaction.

**Start Here**: [Getting Started Guide](guides/GETTING_STARTED.md)

### 🔧 Technical Guides
In-depth technical documentation for developers building on Splendor. Includes API references, smart contract guides, and integration examples.

**Popular**: [API Reference](technical/API_REFERENCE.md) | [Smart Contracts](technical/SMART_CONTRACTS.md)

### 💳 X402 Systems
Two powerful X402 features for different needs:

**Gasless Transactions**: [TND Zero-Fee Guide](x402/README.md) - Remove gas fees for TND token holders  
**Payment Protocol**: [API Monetization](x402/X402-PAYMENT-PROTOCOL.md) - Monetize APIs with cryptocurrency

### 🔒 Security Documentation
Comprehensive security audits, vulnerability reports, and security best practices.

**Key Documents**: [Security Audit Report](security/SECURITY_AUDIT_REPORT.md) | [Security Summary](security/SECURITY_SUMMARY.md)

### 🏛️ Governance & Community
Information about project governance, how to contribute, community guidelines, and the development roadmap.

**Key Documents**: [Roadmap](governance/ROADMAP.md) | [Contributing](governance/CONTRIBUTING.md)

### 🚀 Deployment & Operations
Deployment guides, infrastructure setup, and operational documentation for running Splendor nodes and services.

**Essential**: [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) | [Project Structure](deployment/PROJECT_STRUCTURE.md)

### 📝 Version History
Track all changes, updates, and improvements to the Splendor blockchain.

**Latest**: [CHANGELOG.md](changelog/CHANGELOG.md)

## 🆘 Getting Help

### Documentation Issues
If you find errors in the documentation or have suggestions for improvement:
1. [Open an issue](https://github.com/Splendor-Protocol/splendor-blockchain-v4/issues/new?template=bug_report.md)
2. [Submit a pull request](https://github.com/Splendor-Protocol/splendor-blockchain-v4/pulls)
3. Join our [Telegram](https://t.me/SplendorLabs) for real-time help

### Technical Support
- **General Questions**: [GitHub Discussions](https://github.com/Splendor-Protocol/splendor-blockchain-v4/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/Splendor-Protocol/splendor-blockchain-v4/issues)
- **Validator Support**: Use our [Validator Support Template](https://github.com/Splendor-Protocol/splendor-blockchain-v4/issues/new?template=validator_support.md)
- **Security Issues**: Email security@splendor.org

### Community Support
- **Telegram**: Community discussions and announcements
- **Twitter**: Updates and community engagement
- **Discord**: Developer-focused discussions (coming soon)

## 📝 Contributing to Documentation

We welcome contributions to improve our documentation! Here's how you can help:

### Quick Fixes
For small fixes like typos or clarifications:
1. Click the "Edit" button on any documentation page
2. Make your changes
3. Submit a pull request

### Major Changes
For significant additions or restructuring:
1. [Open an issue](https://github.com/Splendor-Protocol/splendor-blockchain-v4/issues) to discuss your proposal
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request

### Documentation Standards
- Use clear, concise language
- Include code examples where appropriate
- Test all instructions before submitting
- Follow our [style guide](governance/CONTRIBUTING.md#documentation-standards)

## 🔄 Documentation Updates

This documentation is actively maintained and updated regularly. Key information:

- **Last Updated**: January 2025
- **Version**: 4.0.0
- **Update Frequency**: Weekly for minor updates, immediately for critical changes
- **Changelog**: See [CHANGELOG.md](changelog/CHANGELOG.md) for detailed update history

### Staying Updated
- **Watch** the GitHub repository for notifications
- **Follow** our social media channels
- **Subscribe** to our newsletter (coming soon)
- **Join** community channels for real-time updates

## 🎯 Popular Documentation Paths

### New User Journey
1. [Getting Started Guide](guides/GETTING_STARTED.md) - Learn the basics
2. [MetaMask Setup](guides/METAMASK_SETUP.md) - Connect your wallet
3. [Troubleshooting](guides/TROUBLESHOOTING.md) - Solve common issues

### Developer Journey
1. [Getting Started Guide](guides/GETTING_STARTED.md) - Understand the platform
2. [Hardhat Setup Guide](guides/HARDHAT_SETUP_GUIDE.md) - Set up development environment
3. [Smart Contracts](technical/SMART_CONTRACTS.md) - Deploy your first contract
4. [API Reference](technical/API_REFERENCE.md) - Integrate with the blockchain
5. [X402 Gasless](x402/README.md) or [X402 Payments](x402/X402-PAYMENT-PROTOCOL.md) - Choose your X402 feature

### Validator Journey
1. [Validator Guide](guides/VALIDATOR_GUIDE.md) - Complete validator setup
2. [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) - Infrastructure deployment
3. [Troubleshooting](guides/TROUBLESHOOTING.md) - Resolve validator issues

### RPC Operator Journey
1. [RPC Setup Guide](guides/RPC_SETUP_GUIDE.md) - Set up RPC endpoints
2. [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) - Infrastructure setup
3. [Parallel Processing Guide](technical/PARALLEL_PROCESSING_GUIDE.md) - Optimize performance

## 🔍 Search Tips

To find specific information quickly:
- Use the GitHub repository search for code examples
- Check the [Troubleshooting](guides/TROUBLESHOOTING.md) guide for common issues
- Browse category-specific folders for related topics
- Use our community channels for real-time help

---

**Need immediate help?** Join our [Telegram](https://t.me/SplendorLabs) for real-time support from the community and core team.

**Found a bug?** Report it using our [bug report template](https://github.com/Splendor-Protocol/splendor-blockchain-v4/issues/new?template=bug_report.md).

**Want to contribute?** Check out our [contributing guide](governance/CONTRIBUTING.md) to get started.

---

*Last updated: November 8, 2025 | Documentation Version: 4.0.0*
