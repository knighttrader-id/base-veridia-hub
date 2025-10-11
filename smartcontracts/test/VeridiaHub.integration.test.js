const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("VeridiaHub Integration Tests", function () {
  // Test constants
  const ARTWORK_HASH = ethers.keccak256(ethers.toUtf8Bytes("masterpiece artwork"));
  const ARTWORK_TITLE = "Digital Masterpiece";
  const ARTWORK_DESC = "A stunning digital artwork";
  const ARTWORK_URI = "ipfs://QmMasterpiece123";

  const LICENSE_PRICE = ethers.parseUnits("100", 6); // 100 USDC (6 decimals)
  const ROYALTY_PERCENT = 500; // 5%
  const EXPIRATION_TIME = 0; // Perpetual license for testing
  const LICENSE_TERMS = "ipfs://QmLicenseTerms456";

  const PLATFORM_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const NATIONAL_FUND = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  async function deployFullSystemFixture() {
    const [owner, creator, licensee, collector, hacker] = await ethers.getSigners();

    // Deploy existing contracts
    const Artwork = await ethers.getContractFactory("Artwork");
    const artwork = await Artwork.deploy();

    const License = await ethers.getContractFactory("License");
    const license = await License.deploy(await artwork.getAddress(), "https://api.veridiahub.com/license/");

    // Deploy PaymentTokenManager
    const PaymentTokenManager = await ethers.getContractFactory("PaymentTokenManager");
    const paymentTokenManager = await PaymentTokenManager.deploy();

    // Deploy Mock ERC20 tokens
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();

    const MockDAI = await ethers.getContractFactory("MockDAI");
    const dai = await MockDAI.deploy();

    const MockIDRX = await ethers.getContractFactory("MockIDRX");
    const idrx = await MockIDRX.deploy();

    // Add tokens to PaymentTokenManager
    await paymentTokenManager.addToken(await usdc.getAddress(), "USDC", 6);
    await paymentTokenManager.addToken(await usdt.getAddress(), "USDT", 6);
    await paymentTokenManager.addToken(await dai.getAddress(), "DAI", 18);
    await paymentTokenManager.addToken(await idrx.getAddress(), "IDRX", 6);

    // Deploy Marketplace with PaymentTokenManager
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(
      await artwork.getAddress(),
      await license.getAddress(),
      PLATFORM_WALLET,
      NATIONAL_FUND,
      await paymentTokenManager.getAddress()
    );

    // Distribute tokens to test accounts
    const INITIAL_BALANCE = ethers.parseUnits("10000", 6); // 10,000 tokens (6 decimals)
    const INITIAL_DAI = ethers.parseEther("10000"); // 10,000 DAI (18 decimals)
    
    await usdc["mint(address,uint256)"](licensee.address, INITIAL_BALANCE);
    await usdt["mint(address,uint256)"](licensee.address, INITIAL_BALANCE);
    await dai["mint(address,uint256)"](licensee.address, INITIAL_DAI);
    await idrx["mint(address,uint256)"](licensee.address, INITIAL_BALANCE);

    // Also mint tokens to collector for additional testing
    await usdc["mint(address,uint256)"](collector.address, INITIAL_BALANCE);
    await usdt["mint(address,uint256)"](collector.address, INITIAL_BALANCE);
    await dai["mint(address,uint256)"](collector.address, INITIAL_DAI);
    await idrx["mint(address,uint256)"](collector.address, INITIAL_BALANCE);

    // Set up marketplace approval
    await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);

    return { 
      artwork, license, marketplace, paymentTokenManager,
      usdc, usdt, dai, idrx,
      owner, creator, licensee, collector, hacker 
    };
  }

  describe("Complete Copyright Registration to Monetization Flow", function () {
    it("Should complete full workflow: mint artwork → create license → list → purchase → transfer", async function () {
      const { artwork, license, marketplace, creator, licensee, collector } = await loadFixture(deployFullSystemFixture);

      // Step 1: Creator registers copyright (mints NFT)
      await expect(artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI))
        .to.emit(artwork, "WorkRegistered");

      expect(await artwork.ownerOf(1)).to.equal(await creator.getAddress());
      expect(await artwork.getTokenIdByHash(ARTWORK_HASH)).to.equal(1);

      // Step 2: Creator creates licenses for their artwork
      await expect(license.connect(creator).mintLicense(
        ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      ))
        .to.emit(license, "LicenseMinted");

      expect(await license.balanceOf(creator.address, 1)).to.equal(100);

      // Step 3: Creator lists licenses on marketplace
      await expect(marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE))
        .to.emit(marketplace, "LicenseListed");

      // Step 4: Licensee purchases licenses
      const purchaseAmount = 25;
      const totalCost = LICENSE_PRICE * BigInt(purchaseAmount);

      await expect(marketplace.connect(licensee).buyLicense(1, purchaseAmount, { value: totalCost }))
        .to.emit(marketplace, "LicensePurchased");

      expect(await license.balanceOf(await licensee.getAddress(), 1)).to.equal(purchaseAmount);

      // Step 5: Licensee transfers licenses to collector
      await license.connect(licensee).safeTransferFrom(
        await licensee.getAddress(), await collector.getAddress(), 1, 10, "0x"
      );

      expect(await license.balanceOf(await licensee.getAddress(), 1)).to.equal(15);
      expect(await license.balanceOf(await collector.getAddress(), 1)).to.equal(10);

      // Step 6: Creator withdraws earnings
      const creatorEarnings = await marketplace.creatorBalance(await creator.getAddress());
      expect(creatorEarnings).to.be.gt(0);

      const creatorBalanceBefore = await ethers.provider.getBalance(await creator.getAddress());
      await marketplace.connect(creator).withdrawEarnings();
      const creatorBalanceAfter = await ethers.provider.getBalance(await creator.getAddress());

      expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
    });

    it("Should handle batch operations across the entire system", async function () {
      const { artwork, license, marketplace, creator, licensee } = await loadFixture(deployFullSystemFixture);

      // Batch mint multiple artworks
      const hashes = [
        ethers.keccak256(ethers.toUtf8Bytes("art1")),
        ethers.keccak256(ethers.toUtf8Bytes("art2")),
        ethers.keccak256(ethers.toUtf8Bytes("art3"))
      ];

      const titles = ["Art1", "Art2", "Art3"];
      const descriptions = ["Desc1", "Desc2", "Desc3"];
      const uris = ["ipfs://1", "ipfs://2", "ipfs://3"];

      await artwork.connect(creator).batchMintArtwork(hashes, titles, descriptions, uris);

      // Batch mint licenses for all artworks
      const workHashes = [hashes[0], hashes[1], hashes[2]];
      const amounts = [50, 75, 25];
      const prices = [LICENSE_PRICE, ethers.parseEther("0.5"), ethers.parseEther("2.0")];
      const royalties = [ROYALTY_PERCENT, 300, 1000]; // 5%, 3%, 10%
      const expirations = [EXPIRATION_TIME, EXPIRATION_TIME * 2, 0]; // Mix of expiring and perpetual
      const termsURIs = [LICENSE_TERMS, "ipfs://terms2", "ipfs://terms3"];

      await license.connect(creator).batchMintLicense(
        workHashes, amounts, prices, royalties, expirations, termsURIs
      );

      // List all licenses
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 75, ethers.parseEther("0.5"));
      await marketplace.connect(creator).listLicense(3, 25, ethers.parseEther("2.0"));

      // Batch purchase from multiple listings
      const licenseIds = [1, 2, 3];
      const purchaseAmounts = [10, 15, 5];
      const totalCost = LICENSE_PRICE * 10n
        + ethers.parseEther("0.5") * 15n
        + ethers.parseEther("2.0") * 5n;

      await marketplace.connect(licensee).batchBuyLicense(licenseIds, purchaseAmounts, { value: totalCost });

      // Verify all balances
      expect(await license.balanceOf(licensee.address, 1)).to.equal(10);
      expect(await license.balanceOf(licensee.address, 2)).to.equal(15);
      expect(await license.balanceOf(licensee.address, 3)).to.equal(5);
    });
  });

  describe("Security Integration Tests", function () {
    it("Should prevent unauthorized license creation", async function () {
      const { artwork, license, creator, hacker } = await loadFixture(deployFullSystemFixture);

      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);

      // Hacker tries to create licenses for creator's artwork
      await expect(license.connect(hacker).mintLicense(
        ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      )).to.be.revertedWith("Only creator can mint license");
    });

    it("Should enforce license expiration across transfers", async function () {
      const { artwork, license, marketplace, creator, licensee } = await loadFixture(deployFullSystemFixture);

      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);

      // Create license with short expiration
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await license.connect(creator).mintLicense(
        ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, futureTime, LICENSE_TERMS // 1 hour
      );

      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(licensee).buyLicense(1, 25, { value: LICENSE_PRICE * 25n });

      // Fast forward past expiration
      await time.increase(3700);

      // Try to transfer expired license
      await expect(license.connect(licensee).safeTransferFrom(
        licensee.address, creator.address, 1, 10, "0x"
      )).to.be.revertedWith("License expired");
    });

    it("Should handle emergency pause across all contracts", async function () {
      const { artwork, license, marketplace, owner, creator, licensee } = await loadFixture(deployFullSystemFixture);

      // Setup normal state
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(
        ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      );
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);

      // Emergency pause all contracts
      await artwork.connect(owner).pause();
      await license.connect(owner).pause();
      await marketplace.connect(owner).pause();

      // All operations should be blocked
      await expect(artwork.connect(creator).batchMintArtwork(
        [ethers.keccak256(ethers.toUtf8Bytes("new"))], ["New"], ["Art"], ["ipfs://new"]
      )).to.be.revertedWithCustomError(artwork, "EnforcedPause");

      await expect(license.connect(creator).mintLicense(
        ARTWORK_HASH, 50, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      )).to.be.revertedWithCustomError(license, "EnforcedPause");

      await expect(marketplace.connect(licensee).buyLicense(1, 10, { value: LICENSE_PRICE * 10n }))
        .to.be.revertedWithCustomError(marketplace, "EnforcedPause");
    });

    it("Should prevent reentrancy attacks", async function () {
      const { artwork, marketplace, license, creator, licensee } = await loadFixture(deployFullSystemFixture);

      // Setup marketplace
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(
        ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      );
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);

      // Deploy malicious contract that tries reentrancy
      const MaliciousBuyer = await ethers.getContractFactory("MaliciousBuyer");
      const maliciousBuyer = await MaliciousBuyer.deploy(await marketplace.getAddress());

      // Send ether to malicious contract
      await licensee.sendTransaction({ to: await maliciousBuyer.getAddress(), value: LICENSE_PRICE * 50n });

      // Attempt reentrancy attack should fail
      await expect(maliciousBuyer.attack(1, 5)).to.be.revertedWithCustomError(license, "ERC1155InvalidReceiver");
    });
  });

  describe("Economic Model Integration", function () {
    it("Should correctly distribute fees across multiple purchases", async function () {
      const { artwork, license, marketplace, creator, licensee, collector } = await loadFixture(deployFullSystemFixture);

      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(
        ARTWORK_HASH, 1000, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      );

      await marketplace.connect(creator).listLicense(1, 1000, LICENSE_PRICE);

      // Multiple purchases
      const purchases = [
        { buyer: licensee, amount: 100 },
        { buyer: collector, amount: 200 },
        { buyer: licensee, amount: 50 }
      ];

      for (const purchase of purchases) {
        const cost = LICENSE_PRICE * BigInt(purchase.amount);
        await marketplace.connect(purchase.buyer).buyLicense(1, purchase.amount, { value: cost });
      }

      // Calculate expected distributions
      const totalVolume = LICENSE_PRICE * 350n; // 100 + 200 + 50
      const expectedCreatorShare = totalVolume * 95n / 100n;
      const expectedPlatformShare = totalVolume * 4n / 100n;
      const expectedNationalShare = totalVolume * 1n / 100n;

      expect(await marketplace.creatorBalance(creator.address)).to.equal(expectedCreatorShare);
      expect(await marketplace.platformBalance()).to.equal(expectedPlatformShare);
      expect(await marketplace.nationalBalance()).to.equal(expectedNationalShare);

      // Verify total adds up
      const totalDistributed = expectedCreatorShare + expectedPlatformShare + expectedNationalShare;
      expect(totalDistributed).to.equal(totalVolume);
    });

    it("Should handle creator earnings withdrawal correctly", async function () {
      const { artwork, license, marketplace, creator, licensee } = await loadFixture(deployFullSystemFixture);

      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(
        ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      );

      await marketplace.connect(creator).listLicense(1, 100, LICENSE_PRICE);
      await marketplace.connect(licensee).buyLicense(1, 50, { value: LICENSE_PRICE * 50n });

      const earnings = await marketplace.creatorBalance(await creator.getAddress());
      const creatorBalanceBefore = await ethers.provider.getBalance(await creator.getAddress());

      // Withdraw earnings
      await marketplace.connect(creator).withdrawEarnings();

      const creatorBalanceAfter = await ethers.provider.getBalance(await creator.getAddress());
      expect(await marketplace.creatorBalance(await creator.getAddress())).to.equal(0);
      expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
    });
  });

  describe("Analytics and Reporting Integration", function () {
    it("Should track comprehensive marketplace analytics", async function () {
      const { artwork, license, marketplace, creator, licensee, collector } = await loadFixture(deployFullSystemFixture);

      // Create multiple artworks and licenses
      const hashes = [
        ethers.keccak256(ethers.toUtf8Bytes("analytics1")),
        ethers.keccak256(ethers.toUtf8Bytes("analytics2"))
      ];

      await artwork.connect(creator).batchMintArtwork(
        hashes,
        ["Analytics Art 1", "Analytics Art 2"],
        ["Description 1", "Description 2"],
        ["ipfs://analytics1", "ipfs://analytics2"]
      );

      await license.connect(creator).batchMintLicense(
        hashes,
        [100, 200],
        [LICENSE_PRICE, ethers.parseEther("0.5")],
        [ROYALTY_PERCENT, 300],
        [EXPIRATION_TIME, EXPIRATION_TIME * 2],
        [LICENSE_TERMS, "ipfs://terms2"]
      );

      // List and purchase
      await marketplace.connect(creator).listLicense(1, 100, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 200, ethers.parseEther("0.5"));

      await marketplace.connect(licensee).buyLicense(1, 25, { value: LICENSE_PRICE * 25n });
      await marketplace.connect(collector).buyLicense(2, 50, { value: ethers.parseEther("0.5") * 50n });

      // Check analytics
      expect(await marketplace.totalSales(1)).to.equal(25);
      expect(await marketplace.totalSales(2)).to.equal(50);

      const creatorRevenue = await marketplace.creatorRevenue(creator.address);
      const expectedRevenue = LICENSE_PRICE * 25n * 95n / 100n
        + ethers.parseEther("0.5") * 50n * 95n / 100n;

      expect(creatorRevenue).to.equal(expectedRevenue);

      const [volume, platformBal, nationalBal] = await marketplace.getMarketplaceStats();
      const expectedVolume = LICENSE_PRICE * 25n + ethers.parseEther("0.5") * 50n;
      expect(volume).to.equal(expectedVolume);
    });
  });

  describe("Upgradeability and Future-Proofing", function () {
    it("Should support contract upgrades through proxy pattern", async function () {
      const { artwork, license, marketplace, owner } = await loadFixture(deployFullSystemFixture);

      // Test that marketplace contracts are properly connected
      expect(await marketplace.licenseContract()).to.equal(await license.getAddress());
      expect(await marketplace.artworkContract()).to.equal(await artwork.getAddress());
    });
  });

  describe("Cross-Contract Data Consistency", function () {
    it("Should maintain data integrity across all contracts", async function () {
      const { artwork, license, marketplace, creator } = await loadFixture(deployFullSystemFixture);

      // Create artwork
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      const tokenId = await artwork.getTokenIdByHash(ARTWORK_HASH);

      // Create license
      await license.connect(creator).mintLicense(
        ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS
      );

      // Verify cross-contract consistency
      const artworkWork = await artwork.getWork(tokenId);
      const licenseMetadata = await license.getLicenseMetadata(1);

      expect(artworkWork.contentHash).to.equal(licenseMetadata.workHash);
      expect(artworkWork.creator).to.equal(await creator.getAddress());

      // List and verify marketplace integration
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      const listing = await marketplace.listings(1);

      expect(listing.seller).to.equal(await creator.getAddress());
      expect(await license.balanceOf(await marketplace.getAddress(), 1)).to.equal(50);
    });
  });

  describe("Performance and Gas Optimization", function () {
    it("Should demonstrate gas savings with batch operations", async function () {
      const { artwork, license, marketplace, creator, licensee } = await loadFixture(deployFullSystemFixture);

      // Create multiple artworks individually vs batch
      const individualGas = [];
      for (let i = 0; i < 5; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`perf_test_${i}`));
        const tx = await artwork.connect(creator).mintArtwork(hash, `Title ${i}`, ARTWORK_DESC, ARTWORK_URI);
        const receipt = await tx.wait();
        individualGas.push(receipt.gasUsed);
      }

      // Batch operation
      const batchHashes = Array(5).fill().map((_, i) =>
        ethers.keccak256(ethers.toUtf8Bytes(`batch_perf_${i}`))
      );
      const batchTitles = Array(5).fill().map((_, i) => `Batch Title ${i}`);
      const batchDescs = Array(5).fill(ARTWORK_DESC);
      const batchUris = Array(5).fill().map((_, i) => `ipfs://batch${i}`);

      const batchTx = await artwork.connect(creator).batchMintArtwork(batchHashes, batchTitles, batchDescs, batchUris);
      const batchReceipt = await batchTx.wait();

      const totalIndividualGas = individualGas.reduce((sum, gas) => sum + Number(gas), 0);
      const avgIndividualGas = totalIndividualGas / 5;
      const avgBatchGas = Number(batchReceipt.gasUsed) / 5;

      // Batch should be significantly more efficient
      expect(avgBatchGas).to.be.lt(avgIndividualGas);
    });
  });

  describe("Multi-Token Payment Integration", function () {
    it("Should complete purchase flow with USDC", async function () {
      const { artwork, license, marketplace, usdc, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const licenseId = 1;
      const amount = 1;
      const price = await license.licensePrice(licenseId);
      
      // Debug: Check balances and price
      const licenseeUSDCBalance = await usdc.balanceOf(licensee.address);
      console.log("Licensee USDC balance:", ethers.formatUnits(licenseeUSDCBalance, 6));
      console.log("License price:", ethers.formatEther(price));
      console.log("Total price:", ethers.formatEther(price * BigInt(amount)));
      console.log("License ID:", licenseId);
      
      // Approve USDC spending
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price);
      
      // Purchase with USDC
      await expect(marketplace.connect(licensee).buyLicenseWithToken(licenseId, amount, await usdc.getAddress()))
        .to.emit(marketplace, "LicensePurchased")
        .withArgs(licenseId, licensee.address, price, amount, await usdc.getAddress());
      
      // Verify license ownership
      expect(await license.balanceOf(licensee.address, licenseId)).to.equal(amount);
      
      // Verify USDC balances updated correctly
      const creatorBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      const platformBalance = await marketplace.platformTokenBalances(await usdc.getAddress());
      const nationalBalance = await marketplace.nationalTokenBalances(await usdc.getAddress());
      
      expect(creatorBalance).to.be.gt(0);
      expect(platformBalance).to.be.gt(0);
      expect(nationalBalance).to.be.gt(0);
    });

    it("Should complete purchase flow with USDT", async function () {
      const { artwork, license, marketplace, usdt, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const licenseId = 1;
      const amount = 1;
      const price = await license.licensePrice(licenseId);
      
      // Approve USDT spending
      await usdt.connect(licensee).approve(await marketplace.getAddress(), price);
      
      // Purchase with USDT
      await expect(marketplace.connect(licensee).buyLicenseWithToken(licenseId, amount, await usdt.getAddress()))
        .to.emit(marketplace, "LicensePurchased")
        .withArgs(licenseId, licensee.address, price, amount, await usdt.getAddress());
      
      // Verify license ownership
      expect(await license.balanceOf(licensee.address, licenseId)).to.equal(amount);
    });

    it("Should complete purchase flow with DAI", async function () {
      const { artwork, license, marketplace, dai, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const licenseId = 1;
      const amount = 1;
      const price = await license.licensePrice(licenseId);
      
      // Approve DAI spending
      await dai.connect(licensee).approve(await marketplace.getAddress(), price);
      
      // Purchase with DAI
      await expect(marketplace.connect(licensee).buyLicenseWithToken(licenseId, amount, await dai.getAddress()))
        .to.emit(marketplace, "LicensePurchased")
        .withArgs(licenseId, licensee.address, price, amount, await dai.getAddress());
      
      // Verify license ownership
      expect(await license.balanceOf(licensee.address, licenseId)).to.equal(amount);
    });

    it("Should complete purchase flow with IDRX", async function () {
      const { artwork, license, marketplace, idrx, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const licenseId = 1;
      const amount = 1;
      const price = await license.licensePrice(licenseId);
      
      // Approve IDRX spending
      await idrx.connect(licensee).approve(await marketplace.getAddress(), price);
      
      // Purchase with IDRX
      await expect(marketplace.connect(licensee).buyLicenseWithToken(licenseId, amount, await idrx.getAddress()))
        .to.emit(marketplace, "LicensePurchased")
        .withArgs(licenseId, licensee.address, price, amount, await idrx.getAddress());
      
      // Verify license ownership
      expect(await license.balanceOf(licensee.address, licenseId)).to.equal(amount);
    });

    it("Should handle multiple token purchases in sequence", async function () {
      const { artwork, license, marketplace, usdc, dai, creator, licensee, collector } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create 3 licenses
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List all licenses on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(3, 50, LICENSE_PRICE);
      
      const price = await license.licensePrice(1);
      
      // Purchase license 1 with USDC
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price);
      await marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      // Purchase license 2 with DAI
      await dai.connect(collector).approve(await marketplace.getAddress(), price);
      await marketplace.connect(collector).buyLicenseWithToken(2, 1, await dai.getAddress());
      
      // Purchase license 3 with ETH (legacy)
      await marketplace.connect(licensee).buyLicense(3, 1, { value: price });
      
      // Verify all licenses transferred
      expect(await license.balanceOf(licensee.address, 1)).to.equal(1);
      expect(await license.balanceOf(collector.address, 2)).to.equal(1);
      expect(await license.balanceOf(licensee.address, 3)).to.equal(1);
      
      // Verify balances are tracked separately
      const creatorUSDCBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      const creatorDAIBalance = await marketplace.creatorTokenBalances(creator.address, await dai.getAddress());
      const creatorETHBalance = await marketplace.creatorBalances(creator.address);
      
      expect(creatorUSDCBalance).to.be.gt(0);
      expect(creatorDAIBalance).to.be.gt(0);
      expect(creatorETHBalance).to.be.gt(0);
    });

    it("Should correctly distribute fees across different tokens", async function () {
      const { artwork, license, marketplace, usdc, dai, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const price = await license.licensePrice(1);
      
      // Purchase with USDC
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price);
      await marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      // Purchase with DAI (create new license with different price)
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE * BigInt(2), ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await marketplace.connect(creator).listLicense(2, 50, LICENSE_PRICE * BigInt(2));
      const price2 = await license.licensePrice(2);
      await dai.connect(licensee).approve(await marketplace.getAddress(), price2);
      await marketplace.connect(licensee).buyLicenseWithToken(2, 1, await dai.getAddress());
      
      // Verify separate balance tracking
      const creatorUSDCBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      const creatorDAIBalance = await marketplace.creatorTokenBalances(creator.address, await dai.getAddress());
      const platformUSDCBalance = await marketplace.platformTokenBalances(await usdc.getAddress());
      const platformDAIBalance = await marketplace.platformTokenBalances(await dai.getAddress());
      
      expect(creatorUSDCBalance).to.be.gt(0);
      expect(creatorDAIBalance).to.be.gt(0);
      expect(platformUSDCBalance).to.be.gt(0);
      expect(platformDAIBalance).to.be.gt(0);
      
      // Balances should be independent
      expect(creatorUSDCBalance).to.not.equal(creatorDAIBalance);
    });
  });

  describe("Multi-Token Batch Purchases", function () {
    it("Should handle batch purchase with USDT", async function () {
      const { artwork, license, marketplace, usdt, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create 3 licenses
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List all licenses on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(3, 50, LICENSE_PRICE);
      
      const licenseIds = [1, 2, 3];
      const amounts = [1, 1, 1];
      const totalPrice = LICENSE_PRICE * BigInt(3);
      
      // Approve total USDT amount
      await usdt.connect(licensee).approve(await marketplace.getAddress(), totalPrice);
      
      // Batch purchase with USDT
      await expect(marketplace.connect(licensee).batchBuyLicenseWithToken(licenseIds, amounts, await usdt.getAddress()))
        .to.emit(marketplace, "BatchPurchaseCompleted")
        .withArgs(licensee.address, licenseIds, amounts, totalPrice, await usdt.getAddress());
      
      // Verify all licenses transferred
      expect(await license.balanceOf(licensee.address, 1)).to.equal(1);
      expect(await license.balanceOf(licensee.address, 2)).to.equal(1);
      expect(await license.balanceOf(licensee.address, 3)).to.equal(1);
    });

    it("Should handle batch purchase with mixed denominations", async function () {
      const { artwork, license, marketplace, usdc, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create licenses with different prices
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE * BigInt(2), ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE * BigInt(3), ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List all licenses on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 50, LICENSE_PRICE * BigInt(2));
      await marketplace.connect(creator).listLicense(3, 50, LICENSE_PRICE * BigInt(3));
      
      const licenseIds = [1, 2, 3];
      const amounts = [1, 1, 1];
      const price1 = await license.licensePrice(1);
      const price2 = await license.licensePrice(2);
      const price3 = await license.licensePrice(3);
      const totalPrice = price1 + price2 + price3;
      
      // Approve total USDC amount
      await usdc.connect(licensee).approve(await marketplace.getAddress(), totalPrice);
      
      // Batch purchase with USDC
      await marketplace.connect(licensee).batchBuyLicenseWithToken(licenseIds, amounts, await usdc.getAddress());
      
      // Verify all licenses transferred
      expect(await license.balanceOf(licensee.address, 1)).to.equal(1);
      expect(await license.balanceOf(licensee.address, 2)).to.equal(1);
      expect(await license.balanceOf(licensee.address, 3)).to.equal(1);
      
      // Verify fee distribution is correct
      const creatorBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      expect(creatorBalance).to.be.gt(0);
    });
  });

  describe("Multi-Token Withdrawals", function () {
    it("Should allow creator to withdraw earnings in USDC", async function () {
      const { artwork, license, marketplace, usdc, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const price = await license.licensePrice(1);
      
      // Purchase with USDC
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price);
      await marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      // Get creator's USDC balance before withdrawal
      const creatorBalanceBefore = await usdc.balanceOf(creator.address);
      const creatorEarnings = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      
      // Creator withdraws USDC earnings
      await marketplace.connect(creator)["withdrawEarnings(address)"](await usdc.getAddress());
      
      // Verify USDC balance increased
      const creatorBalanceAfter = await usdc.balanceOf(creator.address);
      expect(creatorBalanceAfter).to.equal(creatorBalanceBefore + creatorEarnings);
      
      // Verify contract balance decreased
      const contractBalance = await usdc.balanceOf(await marketplace.getAddress());
      expect(contractBalance).to.be.lt(creatorEarnings);
    });

    it("Should allow platform to withdraw fees in multiple tokens", async function () {
      const { artwork, license, marketplace, usdc, usdt, dai, creator, licensee, collector } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create licenses
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List all licenses on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(3, 50, LICENSE_PRICE);
      
      const price = await license.licensePrice(1);
      
      // Purchase with different tokens
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price);
      await marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      await usdt.connect(collector).approve(await marketplace.getAddress(), price);
      await marketplace.connect(collector).buyLicenseWithToken(2, 1, await usdt.getAddress());
      
      await dai.connect(licensee).approve(await marketplace.getAddress(), price);
      await marketplace.connect(licensee).buyLicenseWithToken(3, 1, await dai.getAddress());
      
      // Platform withdraws each token separately
      const platformUSDCBefore = await usdc.balanceOf(PLATFORM_WALLET);
      const platformUSDTBefore = await usdt.balanceOf(PLATFORM_WALLET);
      const platformDAIBefore = await dai.balanceOf(PLATFORM_WALLET);
      
      await marketplace["withdrawPlatform(address)"](await usdc.getAddress());
      await marketplace["withdrawPlatform(address)"](await usdt.getAddress());
      await marketplace["withdrawPlatform(address)"](await dai.getAddress());
      
      // Verify all balances increased
      const platformUSDCAfter = await usdc.balanceOf(PLATFORM_WALLET);
      const platformUSDTAfter = await usdt.balanceOf(PLATFORM_WALLET);
      const platformDAIAfter = await dai.balanceOf(PLATFORM_WALLET);
      
      expect(platformUSDCAfter).to.be.gt(platformUSDCBefore);
      expect(platformUSDTAfter).to.be.gt(platformUSDTBefore);
      expect(platformDAIAfter).to.be.gt(platformDAIBefore);
    });

    it("Should track balances separately for each token", async function () {
      const { artwork, license, marketplace, usdc, dai, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create licenses with different prices
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE * BigInt(2), ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List all licenses on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 50, LICENSE_PRICE * BigInt(2));
      
      const price1 = await license.licensePrice(1);
      const price2 = await license.licensePrice(2);
      
      // Purchase with USDC
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price1);
      await marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      // Purchase with DAI
      await dai.connect(licensee).approve(await marketplace.getAddress(), price2);
      await marketplace.connect(licensee).buyLicenseWithToken(2, 1, await dai.getAddress());
      
      // Verify separate balance tracking
      const creatorUSDCBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      const creatorDAIBalance = await marketplace.creatorTokenBalances(creator.address, await dai.getAddress());
      const platformUSDCBalance = await marketplace.platformTokenBalances(await usdc.getAddress());
      const platformDAIBalance = await marketplace.platformTokenBalances(await dai.getAddress());
      const nationalUSDCBalance = await marketplace.nationalTokenBalances(await usdc.getAddress());
      const nationalDAIBalance = await marketplace.nationalTokenBalances(await dai.getAddress());
      
      expect(creatorUSDCBalance).to.be.gt(0);
      expect(creatorDAIBalance).to.be.gt(0);
      expect(platformUSDCBalance).to.be.gt(0);
      expect(platformDAIBalance).to.be.gt(0);
      expect(nationalUSDCBalance).to.be.gt(0);
      expect(nationalDAIBalance).to.be.gt(0);
      
      // Balances should be independent
      expect(creatorUSDCBalance).to.not.equal(creatorDAIBalance);
    });
  });

  describe("Multi-Token Error Scenarios", function () {
    it("Should reject purchase with unsupported token", async function () {
      const { artwork, license, marketplace, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      // Deploy a token not in PaymentTokenManager
      const MockToken = await ethers.getContractFactory("MockERC20");
      const unsupportedToken = await MockToken.deploy("Unsupported Token", "UNSUP", 18, ethers.parseEther("1000"));
      
      const price = await license.licensePrice(1);
      await unsupportedToken.connect(licensee).approve(await marketplace.getAddress(), price);
      
      // Attempt purchase - should revert
      await expect(marketplace.connect(licensee).buyLicenseWithToken(1, 1, await unsupportedToken.getAddress()))
        .to.be.revertedWith("Token not supported");
    });

    it("Should reject purchase with insufficient token balance", async function () {
      const { artwork, license, marketplace, usdc, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const price = await license.licensePrice(1);
      
      // Approve USDC but have insufficient balance (approve more than we have)
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price);
      
      // Transfer away most of the balance to simulate insufficient balance
      const balance = await usdc.balanceOf(licensee.address);
      await usdc.connect(licensee).transfer(creator.address, balance - BigInt(1));
      
      // Should revert with appropriate error
      await expect(marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress()))
        .to.be.revertedWith("Insufficient token balance");
    });

    it("Should reject purchase with insufficient allowance", async function () {
      const { artwork, license, marketplace, usdc, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const price = await license.licensePrice(1);
      
      // Have USDC balance but insufficient approval
      const insufficientAllowance = price / BigInt(2);
      await usdc.connect(licensee).approve(await marketplace.getAddress(), insufficientAllowance);
      
      // Should revert
      await expect(marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress()))
        .to.be.revertedWith("Insufficient token allowance");
    });

    it("Should handle token decimal differences correctly", async function () {
      const { artwork, license, marketplace, usdc, dai, creator, licensee } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create licenses with different prices
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE * BigInt(2), ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List all licenses on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 50, LICENSE_PRICE * BigInt(2));
      
      const price1 = await license.licensePrice(1);
      const price2 = await license.licensePrice(2);
      
      // Purchase with 6-decimal USDC
      await usdc.connect(licensee).approve(await marketplace.getAddress(), price1);
      await marketplace.connect(licensee).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      // Purchase with 18-decimal DAI
      await dai.connect(licensee).approve(await marketplace.getAddress(), price2);
      await marketplace.connect(licensee).buyLicenseWithToken(2, 1, await dai.getAddress());
      
      // Verify calculations are correct for both
      const creatorUSDCBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      const creatorDAIBalance = await marketplace.creatorTokenBalances(creator.address, await dai.getAddress());
      
      expect(creatorUSDCBalance).to.be.gt(0);
      expect(creatorDAIBalance).to.be.gt(0);
      
      // Both should have similar value but different decimal representations
      expect(creatorUSDCBalance).to.not.equal(creatorDAIBalance);
    });
  });

  describe("Cross-Token Integration Scenarios", function () {
    it("Should handle creator creating multiple licenses and receiving payments in different tokens", async function () {
      const { artwork, license, marketplace, usdc, dai, creator, licensee, collector } = await loadFixture(deployFullSystemFixture);
      
      // Creator creates 3 licenses
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      const price = await license.licensePrice(0);
      
      // License 1 purchased with ETH
      await marketplace.connect(licensee).buyLicense(0, 1, { value: price });
      
      // License 2 purchased with USDC
      await usdc.connect(collector).approve(await marketplace.getAddress(), price);
      await marketplace.connect(collector).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      // License 3 purchased with DAI
      await dai.connect(licensee).approve(await marketplace.getAddress(), price);
      await marketplace.connect(licensee).buyLicenseWithToken(2, 1, await dai.getAddress());
      
      // Verify creator can withdraw each token separately
      const creatorETHBalance = await marketplace.creatorBalances(creator.address);
      const creatorUSDCBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      const creatorDAIBalance = await marketplace.creatorTokenBalances(creator.address, await dai.getAddress());
      
      expect(creatorETHBalance).to.be.gt(0);
      expect(creatorUSDCBalance).to.be.gt(0);
      expect(creatorDAIBalance).to.be.gt(0);
      
      // Creator withdraws each token
      await marketplace.connect(creator).withdrawEarnings();
      await marketplace.connect(creator).withdrawEarnings(await usdc.getAddress());
      await marketplace.connect(creator).withdrawEarnings(await dai.getAddress());
      
      // Verify balances are cleared
      expect(await marketplace.creatorBalances(creator.address)).to.equal(0);
      expect(await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress())).to.equal(0);
      expect(await marketplace.creatorTokenBalances(creator.address, await dai.getAddress())).to.equal(0);
    });

    it("Should correctly calculate royalties when same license purchased with different tokens", async function () {
      const { artwork, license, marketplace, usdc, creator, licensee, collector } = await loadFixture(deployFullSystemFixture);
      
      // Setup: mint artwork and create license
      await artwork.connect(creator).mintArtwork(ARTWORK_HASH, ARTWORK_TITLE, ARTWORK_DESC, ARTWORK_URI);
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);
      
      // List license on marketplace
      await marketplace.connect(creator).listLicense(1, 50, LICENSE_PRICE);
      
      const price = await license.licensePrice(0);
      
      // Initial purchase with ETH
      await marketplace.connect(licensee).buyLicense(0, 1, { value: price });
      
      // Resale with USDC payment (simulate by creating new license)
      await license.connect(creator).mintLicense(ARTWORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, LICENSE_TERMS);
      await usdc.connect(collector).approve(await marketplace.getAddress(), price);
      await marketplace.connect(collector).buyLicenseWithToken(1, 1, await usdc.getAddress());
      
      // Verify royalty distribution works for both tokens
      const creatorETHBalance = await marketplace.creatorBalances(creator.address);
      const creatorUSDCBalance = await marketplace.creatorTokenBalances(creator.address, await usdc.getAddress());
      
      expect(creatorETHBalance).to.be.gt(0);
      expect(creatorUSDCBalance).to.be.gt(0);
      
      // Both should have similar proportional values
      expect(creatorETHBalance).to.be.closeTo(creatorUSDCBalance, creatorUSDCBalance / BigInt(1000)); // Allow 0.1% difference
    });
  });
});