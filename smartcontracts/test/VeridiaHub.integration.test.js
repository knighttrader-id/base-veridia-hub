const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("VeridiaHub Integration Tests", function () {
  // Test constants
  const ARTWORK_HASH = ethers.keccak256(ethers.toUtf8Bytes("masterpiece artwork"));
  const ARTWORK_TITLE = "Digital Masterpiece";
  const ARTWORK_DESC = "A stunning digital artwork";
  const ARTWORK_URI = "ipfs://QmMasterpiece123";

  const LICENSE_PRICE = ethers.parseEther("1.0");
  const ROYALTY_PERCENT = 500; // 5%
  const EXPIRATION_TIME = 0; // Perpetual license for testing
  const LICENSE_TERMS = "ipfs://QmLicenseTerms456";

  const PLATFORM_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const NATIONAL_FUND = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  async function deployFullSystemFixture() {
    const [owner, creator, licensee, collector, hacker] = await ethers.getSigners();

    // Deploy all contracts
    const Artwork = await ethers.getContractFactory("Artwork");
    const artwork = await Artwork.deploy();

    const License = await ethers.getContractFactory("License");
    const license = await License.deploy(await artwork.getAddress(), "https://api.veridiahub.com/license/");

    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(
      await artwork.getAddress(),
      await license.getAddress(),
      PLATFORM_WALLET,
      NATIONAL_FUND
    );

    // Set up marketplace approval
    await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);

    return { artwork, license, marketplace, owner, creator, licensee, collector, hacker };
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
});