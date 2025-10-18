# VeridiaHub Smart Contracts - Base Sepolia Deployment

This guide covers deploying VeridiaHub smart contracts to Base Sepolia testnet.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Private Key** with testnet ETH
3. **Base Sepolia ETH** for gas fees

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   export PRIVATE_KEY=your_private_key_here
   ```

3. **Get testnet ETH:**
   - Visit [Base Bridge](https://bridge.base.org/deposit)
   - Bridge ETH from Sepolia to Base Sepolia

### Deployment Options

#### Option 1: Full Deployment (Recommended)
Deploy all contracts with complete setup:
```bash
npm run deploy:base-sepolia
```

#### Option 2: Simple Deployment
Deploy core contracts only:
```bash
npm run deploy:simple
```

#### Option 3: Step-by-step
```bash
# 1. Compile contracts
npm run compile

# 2. Run tests
npm run test

# 3. Deploy contracts
npx hardhat run scripts/deploy-base-sepolia.ts --network baseSepolia

# 4. Verify contracts
npm run verify

# 5. Check deployment status
npm run helper
```

## 📋 Deployed Contracts

The deployment script will deploy the following contracts:

| Contract | Purpose | Dependencies |
|----------|---------|--------------|
| **Artwork** | ERC721 NFT registry | None |
| **License** | ERC1155 license tokens | Artwork |
| **LicenseHooks** | License event hooks | License |
| **PaymentTokenManager** | Multi-token payment system | None |
| **Marketplace** | Trading platform | License, Artwork, PaymentTokenManager |
| **MultiSigWallet** | Multi-signature wallet | None |
| **TimelockController** | Governance timelock | MultiSigWallet |
| **UpgradeProxy** | Contract upgradeability | None |
| **EIP2981Royalty** | Royalty standard | None |
| **MockERC20** | Test token (USDT) | None |

## 🔧 Configuration

### Network Configuration
Base Sepolia is configured in `hardhat.config.js`:
```javascript
baseSepolia: {
  url: "https://sepolia.base.org",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 84532,
  gasPrice: 1000000000, // 1 gwei
}
```

### Contract Parameters
- **Platform Fee**: 2.5% (250 basis points)
- **National Contribution**: 1% (100 basis points)
- **Timelock Delay**: 1 hour (for testing)
- **MultiSig Required**: 1 signature (for testing)

## 📊 Deployment Output

After successful deployment, you'll get:
- Contract addresses
- Deployment timestamp
- Network information
- Explorer links
- Saved deployment info in `deployments/base-sepolia.json`

## 🔍 Verification

Verify contracts on BaseScan:
```bash
npm run verify
```

This will verify all contracts on Base Sepolia explorer.

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Test on Base Sepolia:
```bash
npx hardhat test --network baseSepolia
```

## 📁 File Structure

```
smartcontracts/
├── contracts/           # Smart contract source files
├── scripts/            # Deployment scripts
│   ├── deploy-base-sepolia.ts    # Full deployment
│   ├── deploy-simple.ts          # Simple deployment
│   ├── verify-contracts.ts      # Contract verification
│   └── deploy-helper.ts         # Deployment helper
├── deployments/        # Deployment artifacts
│   └── base-sepolia.json        # Deployment info
├── test/               # Test files
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Dependencies and scripts
```

## 🔗 Useful Links

- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Base Bridge**: https://bridge.base.org/
- **Base Documentation**: https://docs.base.org/
- **Hardhat Base Plugin**: https://hardhat.org/plugins/hardhat-base

## 🚨 Troubleshooting

### Common Issues

1. **Insufficient Balance**
   ```
   Error: insufficient funds for gas
   ```
   **Solution**: Get more testnet ETH from Base Bridge

2. **Network Connection**
   ```
   Error: could not detect network
   ```
   **Solution**: Check your internet connection and Base Sepolia RPC

3. **Contract Verification Failed**
   ```
   Error: Contract verification failed
   ```
   **Solution**: Wait a few minutes and try again, or check constructor arguments

4. **Gas Estimation Failed**
   ```
   Error: gas estimation failed
   ```
   **Solution**: Increase gas limit or check contract dependencies

### Getting Help

1. Check deployment logs for specific errors
2. Verify your private key and network connection
3. Ensure sufficient ETH balance
4. Check Base Sepolia network status

## 🎯 Next Steps

After successful deployment:

1. **Update Frontend**: Update contract addresses in frontend config
2. **Test Integration**: Test marketplace and upload functionality
3. **Monitor**: Set up monitoring for deployed contracts
4. **Mainnet**: Deploy to Base Mainnet when ready

## 📝 Notes

- All contracts are deployed with the same deployer address as owner
- MultiSig wallet requires 1 signature for testing (change for production)
- Timelock delay is set to 1 hour for testing (increase for production)
- MockERC20 is deployed for testing (use real tokens for production)

---

**Happy Deploying! 🚀**
