const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Multi-Token Marketplace", function () {
  let artwork, license, marketplace, paymentTokenManager;
  let owner, creator, buyer1, buyer2, platformWallet, nationalFund;
  let mockUSDC, mockUSDT, mockDAI, mockIDRX;

  const WORK_HASH = ethers.keccak256(ethers.toUtf8Bytes("test-work-hash"));
  const LICENSE_PRICE = ethers.parseEther("1.0");
  const ROYALTY_PERCENT = 500; // 5%
  const EXPIRATION_TIME = 0; // Perpetual
  const TERMS_URI = "https://example.com/terms";

  async function deployFullSystemFixture() {
    [owner, creator, buyer1, buyer2, platformWallet, nationalFund] = await ethers.getSigners();

    // Deploy mock tokens
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();

    const MockDAI = await ethers.getContractFactory("MockDAI");
    mockDAI = await MockDAI.deploy();
    await mockDAI.waitForDeployment();

    const MockIDRX = await ethers.getContractFactory("MockIDRX");
    mockIDRX = await MockIDRX.deploy();
    await mockIDRX.waitForDeployment();

    // Deploy PaymentTokenManager
    const PaymentTokenManager = await ethers.getContractFactory("PaymentTokenManager");
    paymentTokenManager = await PaymentTokenManager.deploy();
    await paymentTokenManager.waitForDeployment();

    // Add tokens to whitelist
    await paymentTokenManager.addToken(await mockUSDC.getAddress(), "USDC", 6);
    await paymentTokenManager.addToken(await mockUSDT.getAddress(), "USDT", 6);
    await paymentTokenManager.addToken(await mockDAI.getAddress(), "DAI", 18);
    await paymentTokenManager.addToken(await mockIDRX.getAddress(), "IDRX", 6);

    // Deploy Artwork contract
    const Artwork = await ethers.getContractFactory("Artwork");
    artwork = await Artwork.deploy();
    await artwork.waitForDeployment();

    // Deploy License contract
    const License = await ethers.getContractFactory("License");
    license = await License.deploy(await artwork.getAddress());
    await license.waitForDeployment();

    // Deploy Marketplace contract
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      await artwork.getAddress(),
      await license.getAddress(),
      await platformWallet.getAddress(),
      await nationalFund.getAddress(),
      await paymentTokenManager.getAddress()
    );
    await marketplace.waitForDeployment();

    // Register artwork
    await artwork.connect(creator).mintArtwork(
      WORK_HASH,
      "Test Artwork",
      "Test Description",
      "https://example.com/metadata"
    );

    // Mint license
    const tx = await license.connect(creator).mintLicense(
      WORK_HASH,
      100,
      LICENSE_PRICE,
      ROYALTY_PERCENT,
      EXPIRATION_TIME,
      TERMS_URI
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        const parsed = license.interface.parseLog(log);
        return parsed && parsed.name === "LicenseMinted";
      } catch {
        return false;
      }
    });
    const licenseId = event ? license.interface.parseLog(event).args.licenseId : 1;

    // List license on marketplace
    await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
    await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

    // Fund buyers with tokens
    await mockUSDC.mint(await buyer1.getAddress(), ethers.parseUnits("1000", 6));
    await mockUSDC.mint(await buyer2.getAddress(), ethers.parseUnits("1000", 6));
    await mockUSDT.mint(await buyer1.getAddress(), ethers.parseUnits("1000", 6));
    await mockUSDT.mint(await buyer2.getAddress(), ethers.parseUnits("1000", 6));
    await mockDAI.mint(await buyer1.getAddress(), ethers.parseEther("1000"));
    await mockDAI.mint(await buyer2.getAddress(), ethers.parseEther("1000"));
    await mockIDRX.mint(await buyer1.getAddress(), ethers.parseUnits("1000", 6));
    await mockIDRX.mint(await buyer2.getAddress(), ethers.parseUnits("1000", 6));

    return {
      artwork,
      license,
      marketplace,
      paymentTokenManager,
      mockUSDC,
      mockUSDT,
      mockDAI,
      mockIDRX,
      licenseId,
      creator,
      buyer1,
      buyer2,
      platformWallet,
      nationalFund
    };
  }

  describe("Multi-Token Purchase", function () {
    it("Should buy license with USDC", async function () {
      const { marketplace, license, mockUSDC, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);

      // Approve USDC spending
      await mockUSDC.connect(buyer1).approve(await marketplace.getAddress(), totalPrice);

      // Buy with USDC
      await expect(marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, await mockUSDC.getAddress()))
        .to.emit(marketplace, "LicensePurchased")
        .withArgs(licenseId, await buyer1.getAddress(), totalPrice, amount, await mockUSDC.getAddress());

      // Check balances
      const creatorBalance = await marketplace.creatorTokenBalances(await creator.getAddress(), await mockUSDC.getAddress());
      const platformBalance = await marketplace.platformTokenBalances(await mockUSDC.getAddress());
      const nationalBalance = await marketplace.nationalTokenBalances(await mockUSDC.getAddress());

      expect(creatorBalance).to.be.gt(0);
      expect(platformBalance).to.be.gt(0);
      expect(nationalBalance).to.be.gt(0);
    });

    it("Should buy license with USDT", async function () {
      const { marketplace, mockUSDT, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);

      await mockUSDT.connect(buyer1).approve(await marketplace.getAddress(), totalPrice);
      await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, await mockUSDT.getAddress());

      const creatorBalance = await marketplace.creatorTokenBalances(await creator.getAddress(), await mockUSDT.getAddress());
      expect(creatorBalance).to.be.gt(0);
    });

    it("Should buy license with DAI", async function () {
      const { marketplace, mockDAI, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);

      await mockDAI.connect(buyer1).approve(await marketplace.getAddress(), totalPrice);
      await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, await mockDAI.getAddress());

      const creatorBalance = await marketplace.creatorTokenBalances(await creator.getAddress(), await mockDAI.getAddress());
      expect(creatorBalance).to.be.gt(0);
    });

    it("Should buy license with IDRX", async function () {
      const { marketplace, mockIDRX, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);

      await mockIDRX.connect(buyer1).approve(await marketplace.getAddress(), totalPrice);
      await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, await mockIDRX.getAddress());

      const creatorBalance = await marketplace.creatorTokenBalances(await creator.getAddress(), await mockIDRX.getAddress());
      expect(creatorBalance).to.be.gt(0);
    });

    it("Should buy license with ETH (legacy function)", async function () {
      const { marketplace, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);

      await marketplace.connect(buyer1).buyLicense(licenseId, amount, { value: totalPrice });

      const creatorBalance = await marketplace.creatorBalances(await creator.getAddress());
      expect(creatorBalance).to.be.gt(0);
    });

    it("Should reject purchase with unsupported token", async function () {
      const { marketplace, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(buyer1).buyLicenseWithToken(licenseId, 10, buyer1.address))
        .to.be.revertedWith("Token not supported");
    });

    it("Should reject purchase with insufficient token balance", async function () {
      const { marketplace, mockUSDC, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      // Create buyer with no USDC
      const poorBuyer = await ethers.getSigner();
      await poorBuyer.sendTransaction({ to: poorBuyer.address, value: ethers.parseEther("1") });

      await expect(marketplace.connect(poorBuyer).buyLicenseWithToken(licenseId, 10, await mockUSDC.getAddress()))
        .to.be.revertedWith("Insufficient token balance");
    });

    it("Should reject purchase with insufficient token allowance", async function () {
      const { marketplace, mockUSDC, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      // Don't approve tokens
      await expect(marketplace.connect(buyer1).buyLicenseWithToken(licenseId, 10, await mockUSDC.getAddress()))
        .to.be.revertedWith("Insufficient token allowance");
    });
  });

  describe("Multi-Token Withdrawals", function () {
    beforeEach(async function () {
      const fixture = await loadFixture(deployFullSystemFixture);
      const { marketplace, mockUSDC, buyer1, licenseId } = fixture;

      // Make a purchase to create earnings
      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);
      await mockUSDC.connect(buyer1).approve(await marketplace.getAddress(), totalPrice);
      await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, await mockUSDC.getAddress());
    });

    it("Should withdraw creator earnings in USDC", async function () {
      const { marketplace, mockUSDC, creator } = await loadFixture(deployFullSystemFixture);

      const initialBalance = await mockUSDC.balanceOf(await creator.getAddress());
      await marketplace.connect(creator).withdrawEarnings(await mockUSDC.getAddress());
      const finalBalance = await mockUSDC.balanceOf(await creator.getAddress());

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should withdraw platform earnings in USDC", async function () {
      const { marketplace, mockUSDC, platformWallet } = await loadFixture(deployFullSystemFixture);

      const initialBalance = await mockUSDC.balanceOf(await platformWallet.getAddress());
      await marketplace.connect(platformWallet).withdrawPlatform(await mockUSDC.getAddress());
      const finalBalance = await mockUSDC.balanceOf(await platformWallet.getAddress());

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should withdraw national fund earnings in USDC", async function () {
      const { marketplace, mockUSDC, nationalFund } = await loadFixture(deployFullSystemFixture);

      const initialBalance = await mockUSDC.balanceOf(await nationalFund.getAddress());
      await marketplace.connect(nationalFund).withdrawNational(await mockUSDC.getAddress());
      const finalBalance = await mockUSDC.balanceOf(await nationalFund.getAddress());

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should reject withdrawal with unsupported token", async function () {
      const { marketplace, creator } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(creator).withdrawEarnings(creator.address))
        .to.be.revertedWith("Token not supported");
    });

    it("Should reject withdrawal with no earnings", async function () {
      const { marketplace, mockUSDC, buyer1 } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(buyer1).withdrawEarnings(await mockUSDC.getAddress()))
        .to.be.revertedWith("No earnings");
    });
  });

  describe("Fee Distribution", function () {
    it("Should distribute fees correctly across different tokens", async function () {
      const { marketplace, mockUSDC, mockUSDT, buyer1, buyer2, licenseId } = await loadFixture(deployFullSystemFixture);

      // Purchase with USDC
      const amount1 = 10;
      const totalPrice1 = LICENSE_PRICE * BigInt(amount1);
      await mockUSDC.connect(buyer1).approve(await marketplace.getAddress(), totalPrice1);
      await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount1, await mockUSDC.getAddress());

      // Purchase with USDT
      const amount2 = 5;
      const totalPrice2 = LICENSE_PRICE * BigInt(amount2);
      await mockUSDT.connect(buyer2).approve(await marketplace.getAddress(), totalPrice2);
      await marketplace.connect(buyer2).buyLicenseWithToken(licenseId, amount2, await mockUSDT.getAddress());

      // Check balances are separate
      const usdcCreatorBalance = await marketplace.creatorTokenBalances(await creator.getAddress(), await mockUSDC.getAddress());
      const usdtCreatorBalance = await marketplace.creatorTokenBalances(await creator.getAddress(), await mockUSDT.getAddress());

      expect(usdcCreatorBalance).to.be.gt(0);
      expect(usdtCreatorBalance).to.be.gt(0);
      expect(usdcCreatorBalance).to.not.equal(usdtCreatorBalance);
    });
  });

  describe("Gas Optimization", function () {
    it("Should have reasonable gas costs for token purchases", async function () {
      const { marketplace, mockUSDC, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);
      await mockUSDC.connect(buyer1).approve(await marketplace.getAddress(), totalPrice);

      const tx = await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, await mockUSDC.getAddress());
      const receipt = await tx.wait();

      // Gas cost should be reasonable (less than 200k gas)
      expect(receipt.gasUsed).to.be.lt(200000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount purchase", async function () {
      const { marketplace, mockUSDC, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(buyer1).buyLicenseWithToken(licenseId, 0, await mockUSDC.getAddress()))
        .to.be.revertedWith("Amount zero");
    });

    it("Should handle purchase with exact token balance", async function () {
      const { marketplace, mockUSDC, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 1;
      const totalPrice = LICENSE_PRICE * BigInt(amount);
      
      // Get exact balance needed
      const balance = await mockUSDC.balanceOf(await buyer1.getAddress());
      const needed = totalPrice;
      
      if (balance.gte(needed)) {
        await mockUSDC.connect(buyer1).approve(await marketplace.getAddress(), needed);
        await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, await mockUSDC.getAddress());
      }
    });

    it("Should handle ETH payment with token function", async function () {
      const { marketplace, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      const amount = 10;
      const totalPrice = LICENSE_PRICE * BigInt(amount);

      await marketplace.connect(buyer1).buyLicenseWithToken(licenseId, amount, ethers.ZeroAddress, { value: totalPrice });

      const creatorBalance = await marketplace.creatorBalances(await creator.getAddress());
      expect(creatorBalance).to.be.gt(0);
    });
  });
});
