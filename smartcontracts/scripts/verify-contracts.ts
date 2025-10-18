const { ethers, run } = require("hardhat");

async function main() {
  console.log("🔍 Starting contract verification on Base Sepolia...\n");

  // Read deployment info
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments/base-sepolia.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found. Please run deployment first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log("📋 Verifying contracts from deployment:", deploymentInfo.timestamp);

  try {
    // Verify Artwork
    console.log("1️⃣ Verifying Artwork...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.artwork,
      constructorArguments: [],
    });
    console.log("✅ Artwork verified");

    // Verify License
    console.log("\n2️⃣ Verifying License...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.license,
      constructorArguments: [
        deploymentInfo.contracts.artwork, // _artworkContract
        "https://api.veridiahub.com/license/" // _uri
      ],
    });
    console.log("✅ License verified");

    // Verify PaymentTokenManager
    console.log("\n3️⃣ Verifying PaymentTokenManager...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.paymentTokenManager,
      constructorArguments: [],
    });
    console.log("✅ PaymentTokenManager verified");

    // Verify Marketplace
    console.log("\n4️⃣ Verifying Marketplace...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.marketplace,
      constructorArguments: [
        deploymentInfo.contracts.artwork, // _artworkContract
        deploymentInfo.contracts.license, // _licenseContract
        deploymentInfo.deployer, // _platformWallet
        deploymentInfo.deployer, // _nationalFund
        deploymentInfo.contracts.paymentTokenManager // _paymentTokenManager
      ],
    });
    console.log("✅ Marketplace verified");

    // Verify MultiSigWallet
    console.log("\n5️⃣ Verifying MultiSigWallet...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.multiSigWallet,
      constructorArguments: [
        [deploymentInfo.deployer], // owners
        1 // required
      ],
    });
    console.log("✅ MultiSigWallet verified");

    // Verify TimelockController
    console.log("\n6️⃣ Verifying TimelockController...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.timelockController,
      constructorArguments: [
        deploymentInfo.deployer, // admin_
        172800 // delay_ (2 days)
      ],
    });
    console.log("✅ TimelockController verified");

    // Verify UpgradeProxy
    console.log("\n7️⃣ Verifying UpgradeProxy...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.upgradeProxy,
      constructorArguments: [
        deploymentInfo.contracts.artwork, // _implementation
        deploymentInfo.deployer // _admin
      ],
    });
    console.log("✅ UpgradeProxy verified");

    // Verify MockERC20
    console.log("\n8️⃣ Verifying MockERC20...");
    await run("verify:verify", {
      address: deploymentInfo.contracts.mockERC20,
      constructorArguments: [
        "Tether USD", // name
        "USDT", // symbol
        6, // decimals
        "1000000000000" // initialSupply (1M USDT with 6 decimals)
      ],
    });
    console.log("✅ MockERC20 verified");

    console.log("\n🎉 All contracts verified successfully!");
    console.log("🔗 View verified contracts on BaseScan:");
    console.log("📊 Artwork: https://sepolia.basescan.org/address/" + deploymentInfo.contracts.artwork);
    console.log("📄 License: https://sepolia.basescan.org/address/" + deploymentInfo.contracts.license);
    console.log("🏪 Marketplace: https://sepolia.basescan.org/address/" + deploymentInfo.contracts.marketplace);

  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
