# Banana Fever Dream - Documentation

Welcome to the Banana Fever Dream game documentation! This folder contains all the technical documentation for the project.

## 📚 Documentation Structure

### Setup Guides
- **[Quick Start Gas Sponsorship](setup/QUICK_START_GAS_SPONSORSHIP.md)** - Quick reference for enabling gas-free leaderboard submissions
- **[Gas Sponsorship Setup](setup/GAS_SPONSORSHIP_SETUP.md)** - Comprehensive guide for configuring gas sponsorship
- **[Hybrid Payment Flow](setup/HYBRID_PAYMENT_FLOW.md)** - Current implementation (personal account for payment, smart account for submission)
- **[CoinSlot Gas Sponsorship](setup/COINSLOT_GAS_SPONSORSHIP.md)** - Gas sponsorship setup for the payment system
- **[Smart Account Success](setup/SMART_ACCOUNT_SUCCESS.md)** - Confirmation guide for successful implementation

### Implementation Details
- **[ApeCoin Payment Feature](implementation/APECOIN_PAYMENT_FEATURE.md)** - Complete implementation of the INSERT COIN payment system
- **[Leaderboard Implementation](implementation/LEADERBOARD_IMPLEMENTATION.md)** - Technical details of the leaderboard system
- **[Leaderboard Deployment](implementation/LEADERBOARD_DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Original Wallet Tracking](implementation/ORIGINAL_WALLET_TRACKING.md)** - How we track and display original wallet addresses
- **[Gas Sponsored Payment Flow](implementation/GAS_SPONSORED_PAYMENT_FLOW.md)** - Alternative approach (dual gas sponsorship - for reference)
- **[Changes Summary](implementation/CHANGES_SUMMARY.md)** - Summary of all changes made during development
- **[Documentation Updates](implementation/DOCUMENTATION_UPDATES.md)** - Log of documentation changes

## 🚀 Quick Start

1. **New to the project?** Start with the [main README](../README.md)
2. **Setting up gas sponsorship?** Go to [Quick Start Guide](setup/QUICK_START_GAS_SPONSORSHIP.md)
3. **Deploying the leaderboard?** Check [Deployment Guide](implementation/LEADERBOARD_DEPLOYMENT.md)

## 🎮 Game Features

- **Fast-paced gameplay** - No pause functionality for continuous action
- **Gas-free leaderboard** - Submit scores without paying gas fees
- **Web3 integration** - Log in with MetaMask and other wallets
- **Smart accounts** - Automatic account abstraction for seamless UX
- **Original wallet tracking** - Consistent user identification across sessions

## 🔧 Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Web3**: ThirdWeb + Account Abstraction
- **Blockchain**: ApeChain Curtis (Testnet)
- **Smart Contracts**: Solidity 0.8.20

## 📖 Need Help?

- **Setup issues?** Check the setup guides in `/setup/`
- **Implementation questions?** Review the implementation docs in `/implementation/`
- **General questions?** See the [main README](../README.md)

---

*Last updated: $(date)*
