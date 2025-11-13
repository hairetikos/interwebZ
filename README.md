# interwebZ 🌐🔒

A MetaMask-style Firefox browser extension that connects to your local [Zclassic](https://github.com/ZclassicCommunity/zclassic) full node, enabling seamless interaction with **Web Z** - the decentralized, privacy-focused web powered by the Zclassic blockchain.

THIS PROJECT IS AT INITIAL CONCEPTION STAGE AND IS UNDER CONSTRUCTION LIKE A 2001 GEOCITIES WEBSITE.  IT IS NOT EXPECTED TO WORK JUST YET.

this is the concept.  concept coded, not a vibe.  a concept.

## 🎯 Concept Overview

**interwebZ** bridges the gap between traditional web browsing and the Zclassic blockchain ecosystem. By connecting directly to a local Zclassic full node via RPC (Remote Procedure Call), the extension empowers users to interact with decentralized applications (Z-apps), decentralized Z-exchanges (D-ZEX), participate in privacy-preserving DeFi (Z-fi), play blockchain-based games, and authenticate on Web Z sites - all while maintaining the privacy guarantees provided by Zclassic's advanced cryptographic technology.

## 🔐 Zclassic & zk-SNARK Technology

### What is Zclassic?

Zclassic is a privacy-focused cryptocurrency that inherits the powerful **zk-SNARK** (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) technology from Zcash. This cutting-edge cryptographic framework enables transaction validation without revealing sensitive information about the sender, receiver, or transaction amount.

### Key Technologies We Leverage

#### 1. **Shielded Z-Addresses**
- **Private by Default**: Transactions using z-addresses (shielded addresses) are completely private
- **Encrypted Metadata**: Sender, receiver, and amount remain encrypted on the blockchain
- **Selective Disclosure**: Users can optionally reveal transaction details when needed (e.g., for auditing)

#### 2. **Zero-Knowledge Proofs**
- **Authentication Without Exposure**: Prove identity or ownership without revealing private keys or sensitive data
- **Private Credentials**: Enable passwordless authentication using cryptographic proofs
- **Verifiable Claims**: Make statements about your data without revealing the data itself

#### 3. **Cryptographic Keys**
- **Private Key Security**: Your keys never leave your device; all signing happens locally
- **Hierarchical Deterministic (HD) Wallets**: Generate multiple addresses from a single seed
- **Viewing Keys**: Allow selective transparency by sharing viewing keys without compromising spending ability

## 🌍 Web Z Ecosystem

### What Can You Do with interwebZ?

#### 🔑 **Privacy-Preserving Authentication**
- **No Passwords Needed**: Log into Web Z sites using cryptographic signatures from your z-address
- **Anonymous Identity**: Prove you're authorized without revealing your identity
- **Single Sign-On**: One wallet, unlimited Web Z sites
- **Zero-Knowledge Login**: Authenticate without exposing your address or transaction history

#### 💰 **Z-fi (Decentralized Finance)**
- **Private Transactions**: Send and receive ZCL with complete privacy
- **Shielded Trading**: Interact with decentralized exchanges without exposing your trading strategy
- **Private Lending**: Participate in lending protocols while keeping your financial position private
- **Anonymous Voting**: Participate in DAO governance without revealing your holdings

#### 🎮 **Z-Apps & Gaming**
- **Blockchain Games**: Play games with provably fair outcomes and private inventory
- **NFT Integration**: Manage digital collectibles with optional privacy
- **In-Game Economies**: Trade items privately across games
- **Achievement Systems**: Prove accomplishments without revealing your gaming history

#### 🛠️ **Transaction Capabilities**
- **Instant Payments**: Send ZCL to any Web Z site or user
- **Smart Contract Interaction**: Execute shielded smart contract calls
- **Batch Transactions**: Process multiple operations efficiently
- **Transaction Verification**: Verify payments using zero-knowledge proofs

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Firefox Browser                  │
│  ┌───────────────────────────────────┐  │
│  │     interwebZ Extension            │  │
│  │  - User Interface                  │  │
│  │  - Key Management                  │  │
│  │  - Transaction Signing             │  │
│  └───────────────┬───────────────────┘   │
│              Web Z sites                 │
└──────────────────┼───────────────────────┘
                   │ RPC Communication
                   │ (JSON-RPC over HTTP/HTTPS)
                   ▼
┌─────────────────────────────────────────┐
│     Local Zclassic Full Node            │
│  - Blockchain Synchronization           │
│  - Transaction Broadcasting             │
│  - ZK-Proof Generation & Verification   │
│  - Shielded Pool Management             │
└─────────────────────────────────────────┘
                   │
                   │ P2P Network
                   ▼
┌─────────────────────────────────────────┐
│      Zclassic Blockchain Network        │
│                                         │
│  - Z-fi Applications                    │
│  - Z-Apps & Games                       │
└─────────────────────────────────────────┘
```

### How It Works

1. **Extension Installation**: Install interwebZ in your Firefox browser
2. **Node Connection**: Connect to your local Zclassic full node (default: `localhost:8232`)
3. **Wallet Setup**: Create or import a wallet with z-addresses
4. **Browse Web Z**: Visit Web Z-enabled sites and authenticate/transact seamlessly
5. **Sign Transactions**: Approve transactions with your private key (never shared)
6. **Zero-Knowledge Magic**: The node generates zk-proofs for shielded transactions

## 🚀 Use Cases

### For Users
- **Private Browsing Payments**: Pay for content without revealing your financial history
- **Anonymous Social Networks**: Interact on Web Z social platforms with pseudonymous identities
- **Secure Online Gaming**: Play games where your inventory and actions are provably yours but optionally private
- **Privacy-First Shopping**: Purchase goods and services without creating a permanent public record

### For Developers
- **Build Z-Apps**: Create decentralized applications with built-in privacy
- **Integrate Z-fi**: Add private financial services to your dApps
- **Privacy APIs**: Access Zclassic's privacy features through simple JavaScript APIs
- **User Authentication**: Implement passwordless, privacy-preserving login systems

### For Enterprises
- **Confidential Transactions**: Process business transactions without exposing sensitive amounts
- **Private Supply Chains**: Track goods with selective transparency
- **Employee Systems**: Manage private credentials and access control
- **Compliance Tools**: Prove regulatory compliance without exposing all data

## 🔧 Technical Features

### Extension Capabilities
- ✅ **HD Wallet Management**: Generate and manage hierarchical deterministic wallets
- ✅ **Transparent & Shielded Addresses**: Support for both t-addresses and z-addresses
- ✅ **RPC Integration**: Full JSON-RPC client for Zclassic node communication
- ✅ **Transaction Builder**: Construct complex transactions with multiple inputs/outputs
- ✅ **Signature Provider**: Sign transactions and messages with local private keys
- ✅ **Web3-like API**: Inject JavaScript APIs for Web Z site interaction
- ✅ **Multi-Account Support**: Manage multiple wallets and identities
- ✅ **Hardware Wallet Support**: (Planned) Integration with hardware security modules

### Privacy Features
- 🔒 **Zero-Knowledge Authentication**: Prove authorization without revealing identity
- 🔒 **Shielded Transactions**: Hide sender, receiver, and amount
- 🔒 **Viewing Key Sharing**: Selective transparency for auditing
- 🔒 **Payment Disclosure**: Optionally prove payment details to specific parties
- 🔒 **Encrypted Memos**: Attach private messages to transactions

### Security Features
- 🛡️ **Local Key Storage**: Private keys never leave your device
- 🛡️ **Encrypted Storage**: Keys encrypted with user password
- 🛡️ **Permission System**: Explicit approval required for all transactions
- 🛡️ **Domain Whitelisting**: Control which sites can request transactions
- 🛡️ **Transaction Preview**: Review all details before signing

## 📋 Getting Started

### Prerequisites
1. **Zclassic Full Node**: Download and sync a full node from [ZclassicCommunity/zclassic](https://github.com/ZclassicCommunity/zclassic)
2. **Firefox Browser**: Version 60 or higher
3. **RPC Configuration**: Enable RPC in your `zclassic.conf`:
   ```
   server=1
   rpcuser=your_username
   rpcpassword=your_secure_password
   rpcport=8232
   rpcallowip=127.0.0.1
   ```

### Installation
1. Download the latest release from the [Releases page](#)
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" → "Load Temporary Add-on"
4. Select the `manifest.json` file from the extension directory
5. Click the interwebZ icon in your toolbar to begin setup

### First-Time Setup
1. **Create Wallet**: Generate a new HD wallet or import existing seed
2. **Configure Node**: Enter your local node RPC credentials
3. **Generate Z-Address**: Create your first shielded address
4. **Fund Wallet**: Send some ZCL to your address to get started
5. **Explore Web Z**: Visit Web Z-enabled sites and start interacting!

## 🛣️ Roadmap

- [ ] **v0.1.0**: Basic wallet functionality and RPC integration
- [ ] **v0.2.0**: Web Z authentication protocol implementation
- [ ] **v0.3.0**: Z-fi transaction support (DEX, lending)
- [ ] **v0.4.0**: Gaming and Z-App integration APIs
- [ ] **v0.5.0**: Hardware wallet support
- [ ] **v1.0.0**: Full production release with security audit

## 🤝 Contributing

We welcome contributions! Whether you're a developer, designer, or privacy enthusiast, there's a place for you in the interwebZ project.

### Areas for Contribution
- Extension development (JavaScript, Web Extensions API)
- UI/UX design
- Documentation and tutorials
- Web Z protocol specification
- Security auditing
- Translation and localization

## 📄 License

[Add your license here]

## 🔗 Links

- **Zclassic**: https://github.com/ZclassicCommunity/zclassic
- **Zcash Documentation**: https://z.cash/technology/ (reference for zk-SNARK technology)
- **Web Extensions API**: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

## ⚠️ Disclaimer

This is experimental software. While zk-SNARK technology provides strong privacy guarantees, always practice good operational security. Never share your private keys, and only interact with trusted Web Z sites. The developers are not responsible for any loss of funds or privacy breaches resulting from improper use.

---

**Built with privacy in mind. Powered by zero-knowledge proofs. Welcome to Web Z.**
