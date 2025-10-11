const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Marketplace Contract", function () {
  // Test constants
  const WORK_HASH = ethers.keccak256(ethers.toUtf8Bytes("test artwork"));
  const LICENSE_PRICE = ethers.parseEther("1.0");
  const ROYALTY_PERCENT = 500; // 5%
  const EXPIRATION_TIME = 0; // Perpetual license for testing
  const TERMS_URI = "ipfs://QmTerms123";
  const PLATFORM_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const NATIONAL_FUND = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  async function deployFullSystemFixture() {
    const [owner, creator, buyer1, buyer2, user1] = await ethers.getSigners();

    // Deploy contracts
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

    // Setup approvals
    await license.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);

    // Mint artwork and license
    await artwork.connect(creator).mintArtwork(WORK_HASH, "Test Art", "Description", "ipfs://test");
    const tx = await license.connect(creator).mintLicense(
      WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        const parsed = license.interface.parseLog(log);
        return parsed && parsed.name === "LicenseMinted";
      } catch (e) {
        return false;
      }
    });
    const licenseId = event ? license.interface.parseLog(event).args.licenseId : 1;

    return { marketplace, license, artwork, owner, creator, buyer1, buyer2, user1, licenseId };
  }

  describe("Deployment", function () {
    it("Should set the right contract addresses", async function () {
      const { marketplace, license, artwork } = await loadFixture(deployFullSystemFixture);
      expect(await marketplace.licenseContract()).to.equal(await license.getAddress());
      expect(await marketplace.artworkContract()).to.equal(await artwork.getAddress());
      expect(await marketplace.platformWallet()).to.equal(PLATFORM_WALLET);
      expect(await marketplace.nationalFund()).to.equal(NATIONAL_FUND);
    });
  });

  describe("License Listing", function () {
    it("Should list license successfully", async function () {
      const { marketplace, license, creator } = await loadFixture(deployFullSystemFixture);

      const licenseId = 1;
      const amount = 50;
      const price = LICENSE_PRICE;

      await expect(marketplace.connect(creator).listLicense(licenseId, amount, price))
        .to.emit(marketplace, "LicenseListed")
        .withArgs(licenseId, creator.address, amount, price);

      const listing = await marketplace.listings(licenseId);
      expect(listing.seller).to.equal(creator.address);
      expect(listing.amount).to.equal(amount);
      expect(listing.price).to.equal(price);
      expect(listing.listedAt).to.be.gt(0);
    });

    it("Should only allow license owner to list", async function () {
      const { marketplace, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(buyer1).listLicense(licenseId, 50, LICENSE_PRICE))
        .to.be.revertedWith("Insufficient license balance");
    });

    it("Should update listing price", async function () {
      const { marketplace, creator, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      const newPrice = ethers.parseEther("2.0");

      await expect(marketplace.connect(creator).updateLicensePrice(1, newPrice))
        .to.emit(marketplace, "PriceUpdated")
        .withArgs(1, newPrice);

      const listing = await marketplace.listings(1);
      expect(listing.price).to.equal(newPrice);
    });

    it("Should only allow seller to update price", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      await expect(marketplace.connect(buyer1).updateLicensePrice(licenseId, ethers.parseEther("2.0")))
        .to.be.revertedWith("Not license owner");
    });
  });

  describe("Single License Purchase", function () {
    it("Should purchase license with correct fee distribution", async function () {
      const { marketplace, license, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      const buyerBalanceBefore = await ethers.provider.getBalance(await buyer1.getAddress());
      const creatorBalanceBefore = await ethers.provider.getBalance(await creator.getAddress());
      const platformBalanceBefore = await ethers.provider.getBalance(PLATFORM_WALLET);
      const nationalBalanceBefore = await ethers.provider.getBalance(NATIONAL_FUND);

      // Purchase 25 licenses
      const purchaseAmount = 25n;
      const totalCost = LICENSE_PRICE * purchaseAmount;

      await expect(marketplace.connect(buyer1).buyLicense(licenseId, purchaseAmount, { value: totalCost }))
        .to.emit(marketplace, "LicensePurchased")
        .withArgs(licenseId, await buyer1.getAddress(), totalCost, Number(purchaseAmount));

      // Check balances
      expect(await license.balanceOf(await buyer1.getAddress(), licenseId)).to.equal(purchaseAmount);
      expect(await license.balanceOf(await marketplace.getAddress(), licenseId)).to.equal(25); // 50 - 25

      // Check fee distribution
      const creatorShare = totalCost * 95n / 100n; // 95%
      const platformShare = totalCost * 4n / 100n; // 4%
      const nationalShare = totalCost * 1n / 100n; // 1%

      expect(await marketplace.creatorBalance(await creator.getAddress())).to.equal(creatorShare);
      expect(await marketplace.platformBalance()).to.equal(platformShare);
      expect(await marketplace.nationalBalance()).to.equal(nationalShare);
    });

    it("Should revert on insufficient payment", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      const insufficientPayment = LICENSE_PRICE - ethers.parseEther("0.1");

      await expect(marketplace.connect(buyer1).buyLicense(1, 1, { value: insufficientPayment }))
        .to.be.revertedWith("Insufficient payment");
    });

    it("Should revert on insufficient listing amount", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 10, LICENSE_PRICE); // Only 10 available

      await expect(marketplace.connect(buyer1).buyLicense(licenseId, 15, { value: LICENSE_PRICE * 15n }))
        .to.be.revertedWith("Insufficient marketplace supply");
    });

    it("Should refund excess payment", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      const payment = LICENSE_PRICE * 10n; // Pay for 10, only need 1
      const buyerBalanceBefore = await ethers.provider.getBalance(await buyer1.getAddress());

      const tx = await marketplace.connect(buyer1).buyLicense(licenseId, 1, { value: payment });
      const receipt = await tx.wait();
      const gasCost = BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice);

      const buyerBalanceAfter = await ethers.provider.getBalance(await buyer1.getAddress());
      const expectedRefund = payment - LICENSE_PRICE;

      // Should get refund minus gas costs
      expect(Number(buyerBalanceAfter + gasCost)).to.be.closeTo(Number(buyerBalanceBefore - LICENSE_PRICE), Number(ethers.parseEther("0.01")));
    });
  });

  describe("Batch License Purchase", function () {
    it("Should batch purchase multiple licenses", async function () {
      const { marketplace, license, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      // Mint additional licenses
      await license.connect(creator).mintLicense(
        WORK_HASH, 75, ethers.parseEther("0.5"), ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );
      await license.connect(creator).mintLicense(
        WORK_HASH, 25, ethers.parseEther("2.0"), ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      // List all licenses
      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 75, ethers.parseEther("0.5"));
      await marketplace.connect(creator).listLicense(3, 25, ethers.parseEther("2.0"));

      // Batch purchase
      const licenseIds = [1, 2, 3];
      const amounts = [10, 20, 5];
      const totalCost = LICENSE_PRICE * 10n + ethers.parseEther("0.5") * 20n + ethers.parseEther("2.0") * 5n;

      await expect(marketplace.connect(buyer1).batchBuyLicense(licenseIds, amounts, { value: totalCost }))
        .to.emit(marketplace, "BatchPurchaseCompleted")
        .withArgs(buyer1.address, licenseIds, amounts, totalCost);

      // Check balances
      expect(await license.balanceOf(buyer1.address, 1)).to.equal(10);
      expect(await license.balanceOf(buyer1.address, 2)).to.equal(20);
      expect(await license.balanceOf(buyer1.address, 3)).to.equal(5);
    });

    it("Should revert batch purchase with mismatched arrays", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      await expect(marketplace.connect(buyer1).batchBuyLicense([licenseId], [10, 20], { value: LICENSE_PRICE * 30n }))
        .to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Earnings Withdrawal", function () {
    it("Should allow creator to withdraw earnings", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(buyer1).buyLicense(licenseId, 10, { value: LICENSE_PRICE * 10n });

      const creatorEarnings = await marketplace.creatorBalance(await creator.getAddress());
      expect(creatorEarnings).to.be.gt(0);

      const creatorBalanceBefore = await ethers.provider.getBalance(await creator.getAddress());

      await expect(marketplace.connect(creator).withdrawEarnings())
        .to.emit(marketplace, "EarningsWithdrawn")
        .withArgs(await creator.getAddress(), creatorEarnings);

      const creatorBalanceAfter = await ethers.provider.getBalance(await creator.getAddress());
      expect(await marketplace.creatorBalance(await creator.getAddress())).to.equal(0);
    });

    it("Should prevent withdrawal with no earnings", async function () {
      const { marketplace, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(buyer1).withdrawEarnings())
        .to.be.revertedWith("No earnings");
    });
  });

  describe("Analytics and Statistics", function () {
    it("Should track total sales correctly", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      await marketplace.connect(buyer1).buyLicense(1, 10, { value: LICENSE_PRICE * 10n });
      expect(await marketplace.totalSales(1)).to.equal(10);

      await marketplace.connect(buyer1).buyLicense(1, 5, { value: LICENSE_PRICE * 5n });
      expect(await marketplace.totalSales(1)).to.equal(15);
    });

    it("Should track creator revenue", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(buyer1).buyLicense(licenseId, 10, { value: LICENSE_PRICE * 10n });

      const expectedRevenue = LICENSE_PRICE * 10n * 95n / 100n;
      expect(await marketplace.creatorRevenue(await creator.getAddress())).to.equal(expectedRevenue);
    });

    it("Should provide marketplace statistics", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(buyer1).buyLicense(licenseId, 10, { value: LICENSE_PRICE * 10n });

      const [volume, platformBal, nationalBal] = await marketplace.getMarketplaceStats();
      expect(volume).to.equal(LICENSE_PRICE * 10n);
      expect(platformBal).to.equal(LICENSE_PRICE * 10n * 4n / 100n);
      expect(nationalBal).to.equal(LICENSE_PRICE * 10n * 1n / 100n);
    });
  });

  describe("Pausable Functionality", function () {
    it("Should prevent purchases when paused", async function () {
      const { marketplace, owner, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(owner).pause();

      await expect(marketplace.connect(buyer1).buyLicense(licenseId, 10, { value: LICENSE_PRICE * 10n }))
        .to.be.revertedWithCustomError(marketplace, "EnforcedPause");
    });

    it("Should allow purchases when unpaused", async function () {
      const { marketplace, owner, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(owner).pause();
      await marketplace.connect(owner).unpause();

      await expect(marketplace.connect(buyer1).buyLicense(licenseId, 10, { value: LICENSE_PRICE * 10n }))
        .to.emit(marketplace, "LicensePurchased");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update platform wallet", async function () {
      const { marketplace, owner } = await loadFixture(deployFullSystemFixture);

      const newWallet = "0x1234567890123456789012345678901234567890";
      await marketplace.connect(owner).updatePlatformWallet(newWallet);
      expect(await marketplace.platformWallet()).to.equal(newWallet);
    });

    it("Should prevent non-owner from updating platform wallet", async function () {
      const { marketplace, creator, licenseId } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(creator).updatePlatformWallet(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update national fund", async function () {
      const { marketplace, owner } = await loadFixture(deployFullSystemFixture);

      const newFund = "0x1234567890123456789012345678901234567890";
      await marketplace.connect(owner).updateNationalFund(newFund);
      expect(await marketplace.nationalFund()).to.equal(newFund);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should be more efficient with batch purchases", async function () {
      const { marketplace, license, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      // Create multiple listings
      await license.connect(creator).mintLicense(
        WORK_HASH, 50, ethers.parseEther("0.5"), ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );
      await license.connect(creator).mintLicense(
        WORK_HASH, 25, ethers.parseEther("2.0"), ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(creator).listLicense(2, 50, ethers.parseEther("0.5"));
      await marketplace.connect(creator).listLicense(3, 25, ethers.parseEther("2.0"));

      // Batch purchase 3 licenses
      const licenseIds = [licenseId, licenseId, licenseId];
      const amounts = [5, 10, 3];
      const totalCost = LICENSE_PRICE * 5n + LICENSE_PRICE * 10n + LICENSE_PRICE * 3n;

      const batchTx = await marketplace.connect(buyer1).batchBuyLicense(licenseIds, amounts, { value: totalCost });
      const batchReceipt = await batchTx.wait();

      // Individual purchases for comparison
      let totalIndividualGas = 0;
      for (let i = 0; i < 3; i++) {
        const tx = await marketplace.connect(buyer1).buyLicense(licenseId, amounts[i], { value: LICENSE_PRICE * BigInt(amounts[i]) });
        const receipt = await tx.wait();
        totalIndividualGas = totalIndividualGas + Number(receipt.gasUsed);
      }

      // Batch should be more efficient
      expect(batchReceipt.gasUsed).to.be.lt(totalIndividualGas);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle zero amount purchases", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      await expect(marketplace.connect(buyer1).buyLicense(licenseId, 0, { value: 0 }))
        .to.be.revertedWith("Amount zero");
    });

    it("Should handle unlisted licenses", async function () {
      const { marketplace, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await expect(marketplace.connect(buyer1).buyLicense(licenseId, 10, { value: LICENSE_PRICE * 10n }))
        .to.be.revertedWith("Insufficient marketplace supply");
    });

    it("Should handle expired licenses", async function () {
      const { marketplace, license, creator, buyer1 } = await loadFixture(deployFullSystemFixture);

      // Mint license with short expiration
      const tx = await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, Math.floor(Date.now() / 1000) + 3600, TERMS_URI // 1 hour from now
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = license.interface.parseLog(log);
          return parsed && parsed.name === "LicenseMinted";
        } catch (e) {
          return false;
        }
      });
      const expiredLicenseId = event ? license.interface.parseLog(event).args.licenseId : 1;

      await marketplace.connect(creator).listLicense(expiredLicenseId, 50, LICENSE_PRICE);

      // Fast forward past expiration
      await ethers.provider.send("evm_increaseTime", [3700]);
      await ethers.provider.send("evm_mine");

      await expect(marketplace.connect(buyer1).buyLicense(expiredLicenseId, 10, { value: LICENSE_PRICE * 10n }))
        .to.be.revertedWith("License expired");
    });
  });

  describe("Event Emissions", function () {
    it("Should emit correct events on purchase", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      const purchaseAmount = 10n;
      const totalCost = LICENSE_PRICE * purchaseAmount;

      await expect(marketplace.connect(buyer1).buyLicense(licenseId, purchaseAmount, { value: totalCost }))
        .to.emit(marketplace, "LicensePurchased")
        .withArgs(licenseId, await buyer1.getAddress(), totalCost, Number(purchaseAmount));
    });

    it("Should emit events on batch purchase", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);

      const licenseIds = [licenseId];
      const amounts = [5];
      const totalCost = LICENSE_PRICE * 5n;

      await expect(marketplace.connect(buyer1).batchBuyLicense(licenseIds, amounts, { value: totalCost }))
        .to.emit(marketplace, "BatchPurchaseCompleted")
        .withArgs(await buyer1.getAddress(), licenseIds, amounts, totalCost);
    });

    it("Should emit events on withdrawal", async function () {
      const { marketplace, creator, buyer1, licenseId } = await loadFixture(deployFullSystemFixture);

      await marketplace.connect(creator).listLicense(licenseId, 50, LICENSE_PRICE);
      await marketplace.connect(buyer1).buyLicense(1, 10, { value: LICENSE_PRICE * 10n });

      const earnings = await marketplace.creatorBalance(creator.address);

      await expect(marketplace.connect(creator).withdrawEarnings())
        .to.emit(marketplace, "EarningsWithdrawn")
        .withArgs(creator.address, earnings);
    });
  });
});