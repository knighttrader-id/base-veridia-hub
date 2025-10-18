const { ethers } = require("hardhat");

interface ContractInfo {
  name: string;
  address: string;
  explorer: string;
}

async function main() {
  console.log("🛠️  VeridiaHub Deployment Helper for Base Sepolia\n");

  // Check environment
  console.log("🔍 Checking deployment environment...");
  
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  const network = await deployer.provider.getNetwork();
  
  console.log("📋 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId, ")");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance! You may need more ETH for deployment.");
    console.log("💡 Get testnet ETH from: https://bridge.base.org/deposit");
  }

  // Check if contracts are already deployed
  console.log("\n🔍 Checking for existing deployments...");
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments/base-sepolia.json');
  
  if (fs.existsSync(deploymentPath)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("📄 Found existing deployment from:", deploymentInfo.timestamp);
    
    const contracts: ContractInfo[] = [
      { name: "Artwork", address: deploymentInfo.contracts.artwork, explorer: "https://sepolia.basescan.org/address/" },
      { name: "License", address: deploymentInfo.contracts.license, explorer: "https://sepolia.basescan.org/address/" },
      { name: "Marketplace", address: deploymentInfo.contracts.marketplace, explorer: "https://sepolia.basescan.org/address/" },
      { name: "PaymentTokenManager", address: deploymentInfo.contracts.paymentTokenManager, explorer: "https://sepolia.basescan.org/address/" },
      { name: "MultiSigWallet", address: deploymentInfo.contracts.multiSigWallet, explorer: "https://sepolia.basescan.org/address/" },
      { name: "TimelockController", address: deploymentInfo.contracts.timelockController, explorer: "https://sepolia.basescan.org/address/" },
      { name: "UpgradeProxy", address: deploymentInfo.contracts.upgradeProxy, explorer: "https://sepolia.basescan.org/address/" },
      { name: "EIP2981Royalty", address: deploymentInfo.contracts.eip2981Royalty, explorer: "https://sepolia.basescan.org/address/" },
      { name: "MockERC20", address: deploymentInfo.contracts.mockERC20, explorer: "https://sepolia.basescan.org/address/" }
    ];

    console.log("\n📋 Deployed Contracts:");
    console.log("=====================");
    contracts.forEach(contract => {
      console.log(`🎯 ${contract.name}: ${contract.address}`);
      console.log(`🔗 Explorer: ${contract.explorer}${contract.address}`);
      console.log("");
    });

    // Test contract interactions
    console.log("🧪 Testing contract interactions...");
    try {
      const Artwork = await ethers.getContractFactory("Artwork");
      const artwork = Artwork.attach(deploymentInfo.contracts.artwork);
      const name = await artwork.name();
      const symbol = await artwork.symbol();
      console.log(`✅ Artwork contract responsive: ${name} (${symbol})`);
    } catch (error) {
      console.log("❌ Artwork contract not responsive:", error);
    }

  } else {
    console.log("📄 No existing deployment found.");
    console.log("💡 Run 'npx hardhat run scripts/deploy-base-sepolia.ts --network baseSepolia' to deploy contracts.");
  }

  // Deployment instructions
  console.log("\n📖 Deployment Instructions:");
  console.log("==========================");
  console.log("1️⃣  Set your private key: export PRIVATE_KEY=your_private_key_here");
  console.log("2️⃣  Get testnet ETH: https://bridge.base.org/deposit");
  console.log("3️⃣  Deploy contracts: npx hardhat run scripts/deploy-base-sepolia.ts --network baseSepolia");
  console.log("4️⃣  Verify contracts: npx hardhat run scripts/verify-contracts.ts --network baseSepolia");
  console.log("5️⃣  Test contracts: npx hardhat test --network baseSepolia");

  console.log("\n🔗 Useful Links:");
  console.log("================");
  console.log("🌐 Base Sepolia Explorer: https://sepolia.basescan.org/");
  console.log("🌉 Base Bridge: https://bridge.base.org/");
  console.log("💧 Faucet: https://bridge.base.org/deposit");
  console.log("📚 Base Docs: https://docs.base.org/");
  console.log("🛠️  Hardhat Base Plugin: https://hardhat.org/plugins/hardhat-base");

  console.log("\n🎯 Next Steps:");
  console.log("=============");
  console.log("• Update frontend config with deployed contract addresses");
  console.log("• Test marketplace functionality");
  console.log("• Deploy to Base Mainnet when ready");
  console.log("• Set up monitoring and alerts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
