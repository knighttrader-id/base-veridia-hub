const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting VeridiaHub deployment to Base Sepolia...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  const deployedContracts: any = {};

  try {
    // 1. Deploy MockERC20 first (needed for PaymentTokenManager)
    console.log("1️⃣ Deploying MockERC20...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    deployedContracts.mockERC20 = await MockERC20.deploy(
      "Tether USD", // name
      "USDT", // symbol
      6, // decimals
      ethers.parseUnits("1000000", 6) // initialSupply (1M USDT)
    );
    await deployedContracts.mockERC20.waitForDeployment();
    console.log("✅ MockERC20 deployed to:", await deployedContracts.mockERC20.getAddress());

    // 2. Deploy PaymentTokenManager
    console.log("\n2️⃣ Deploying PaymentTokenManager...");
    const PaymentTokenManager = await ethers.getContractFactory("PaymentTokenManager");
    deployedContracts.paymentTokenManager = await PaymentTokenManager.deploy();
    await deployedContracts.paymentTokenManager.waitForDeployment();
    console.log("✅ PaymentTokenManager deployed to:", await deployedContracts.paymentTokenManager.getAddress());

    // 3. Deploy Artwork contract
    console.log("\n3️⃣ Deploying Artwork contract...");
    const Artwork = await ethers.getContractFactory("Artwork");
    deployedContracts.artwork = await Artwork.deploy();
    await deployedContracts.artwork.waitForDeployment();
    console.log("✅ Artwork deployed to:", await deployedContracts.artwork.getAddress());

    // 4. Deploy License contract
    console.log("\n4️⃣ Deploying License contract...");
    const License = await ethers.getContractFactory("License");
    deployedContracts.license = await License.deploy(
      await deployedContracts.artwork.getAddress(), // _artworkContract
      "https://api.veridiahub.com/license/" // _uri
    );
    await deployedContracts.license.waitForDeployment();
    console.log("✅ License deployed to:", await deployedContracts.license.getAddress());

    // 5. Deploy Marketplace
    console.log("\n5️⃣ Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    deployedContracts.marketplace = await Marketplace.deploy(
      await deployedContracts.artwork.getAddress(), // _artworkContract
      await deployedContracts.license.getAddress(), // _licenseContract
      deployer.address, // _platformWallet
      deployer.address, // _nationalFund
      await deployedContracts.paymentTokenManager.getAddress() // _paymentTokenManager
    );
    await deployedContracts.marketplace.waitForDeployment();
    console.log("✅ Marketplace deployed to:", await deployedContracts.marketplace.getAddress());

    // 6. Deploy MultiSigWallet
    console.log("\n6️⃣ Deploying MultiSigWallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const owners = [deployer.address]; // Single owner for testing
    const required = 1; // Require 1 signature for testing
    deployedContracts.multiSigWallet = await MultiSigWallet.deploy(owners, required);
    await deployedContracts.multiSigWallet.waitForDeployment();
    console.log("✅ MultiSigWallet deployed to:", await deployedContracts.multiSigWallet.getAddress());

    // 7. Deploy TimelockController
    console.log("\n7️⃣ Deploying TimelockController...");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    const delay = 172800; // 2 days minimum delay
    const admin = deployer.address;
    
    deployedContracts.timelockController = await TimelockController.deploy(
      admin, // admin_
      delay // delay_
    );
    await deployedContracts.timelockController.waitForDeployment();
    console.log("✅ TimelockController deployed to:", await deployedContracts.timelockController.getAddress());

    // 8. Deploy UpgradeProxy
    console.log("\n8️⃣ Deploying UpgradeProxy...");
    const UpgradeProxy = await ethers.getContractFactory("UpgradeProxy");
    deployedContracts.upgradeProxy = await UpgradeProxy.deploy(
      await deployedContracts.artwork.getAddress(), // _implementation (using Artwork as example)
      deployer.address // _admin
    );
    await deployedContracts.upgradeProxy.waitForDeployment();
    console.log("✅ UpgradeProxy deployed to:", await deployedContracts.upgradeProxy.getAddress());

    // Setup initial configuration
    console.log("\n🔧 Setting up initial configuration...");
    
    // Add supported tokens to PaymentTokenManager
    console.log("   Adding supported tokens...");
    await deployedContracts.paymentTokenManager.addToken(
      await deployedContracts.mockERC20.getAddress(),
      "USDT",
      6
    );
    console.log("   ✅ Added USDT token");

    // Note: PaymentTokenManager doesn't require marketplace authorization
    console.log("   ✅ PaymentTokenManager configured");

    // Verify deployments
    console.log("\n🔍 Verifying deployments...");
    const network = await deployer.provider.getNetwork();
    console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId, ")");
    
    console.log("\n📋 Deployment Summary:");
    console.log("===================");
    console.log("🎨 Artwork:", await deployedContracts.artwork.getAddress());
    console.log("📄 License:", await deployedContracts.license.getAddress());
    console.log("🏪 Marketplace:", await deployedContracts.marketplace.getAddress());
    console.log("💳 PaymentTokenManager:", await deployedContracts.paymentTokenManager.getAddress());
    console.log("👥 MultiSigWallet:", await deployedContracts.multiSigWallet.getAddress());
    console.log("⏰ TimelockController:", await deployedContracts.timelockController.getAddress());
    console.log("🔄 UpgradeProxy:", await deployedContracts.upgradeProxy.getAddress());
    console.log("🪙 MockERC20:", await deployedContracts.mockERC20.getAddress());

    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        artwork: await deployedContracts.artwork.getAddress(),
        license: await deployedContracts.license.getAddress(),
        marketplace: await deployedContracts.marketplace.getAddress(),
        paymentTokenManager: await deployedContracts.paymentTokenManager.getAddress(),
        multiSigWallet: await deployedContracts.multiSigWallet.getAddress(),
        timelockController: await deployedContracts.timelockController.getAddress(),
        upgradeProxy: await deployedContracts.upgradeProxy.getAddress(),
        mockERC20: await deployedContracts.mockERC20.getAddress()
      }
    };

    // Write deployment info to file
    const fs = require('fs');
    const path = require('path');
    const deploymentPath = path.join(__dirname, '../deployments/base-sepolia.json');
    
    // Ensure deployments directory exists
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentPath);

    console.log("\n🎉 VeridiaHub successfully deployed to Base Sepolia!");
    console.log("🔗 Base Sepolia Explorer: https://sepolia.basescan.org/");
    console.log("📊 View your contracts at: https://sepolia.basescan.org/address/" + deployer.address);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
