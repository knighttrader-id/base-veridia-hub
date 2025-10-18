const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple deployment to Base Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  try {
    // Deploy Artwork contract
    console.log("1️⃣ Deploying Artwork...");
    const Artwork = await ethers.getContractFactory("Artwork");
    const artwork = await Artwork.deploy();
    await artwork.waitForDeployment();
    console.log("✅ Artwork deployed to:", await artwork.getAddress());

    // Deploy License contract
    console.log("\n2️⃣ Deploying License...");
    const License = await ethers.getContractFactory("License");
    const license = await License.deploy(
      await artwork.getAddress(), // _artworkContract
      "https://api.veridiahub.com/license/" // _uri
    );
    await license.waitForDeployment();
    console.log("✅ License deployed to:", await license.getAddress());

    // Deploy MockERC20
    console.log("\n3️⃣ Deploying MockERC20...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy(
      "Tether USD", // name
      "USDT", // symbol
      6, // decimals
      ethers.parseUnits("1000000", 6) // initialSupply (1M USDT)
    );
    await mockERC20.waitForDeployment();
    console.log("✅ MockERC20 deployed to:", await mockERC20.getAddress());

    // Deploy PaymentTokenManager
    console.log("\n4️⃣ Deploying PaymentTokenManager...");
    const PaymentTokenManager = await ethers.getContractFactory("PaymentTokenManager");
    const paymentTokenManager = await PaymentTokenManager.deploy();
    await paymentTokenManager.waitForDeployment();
    console.log("✅ PaymentTokenManager deployed to:", await paymentTokenManager.getAddress());

    // Deploy Marketplace
    console.log("\n5️⃣ Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(
      await artwork.getAddress(), // _artworkContract
      await license.getAddress(), // _licenseContract
      deployer.address, // _platformWallet
      deployer.address, // _nationalFund
      await paymentTokenManager.getAddress() // _paymentTokenManager
    );
    await marketplace.waitForDeployment();
    console.log("✅ Marketplace deployed to:", await marketplace.getAddress());

    console.log("\n🎉 Simple deployment completed!");
    console.log("📋 Contract Addresses:");
    console.log("🎨 Artwork:", await artwork.getAddress());
    console.log("📄 License:", await license.getAddress());
    console.log("🪙 MockERC20:", await mockERC20.getAddress());
    console.log("💳 PaymentTokenManager:", await paymentTokenManager.getAddress());
    console.log("🏪 Marketplace:", await marketplace.getAddress());

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
