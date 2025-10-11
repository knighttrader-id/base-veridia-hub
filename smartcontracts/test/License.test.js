const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("License Contract", function () {
  // Test constants
  const WORK_HASH = ethers.keccak256(ethers.toUtf8Bytes("test artwork"));
  const LICENSE_PRICE = ethers.parseEther("1.0");
  const ROYALTY_PERCENT = 500; // 5%
  const EXPIRATION_TIME = 0; // Perpetual license for testing
  const TERMS_URI = "ipfs://QmTerms123";

  async function deployContractsFixture() {
    const [owner, creator, buyer, user1, user2] = await ethers.getSigners();

    // Deploy Artwork contract first
    const Artwork = await ethers.getContractFactory("Artwork");
    const artwork = await Artwork.deploy();

    // Deploy License contract
    const License = await ethers.getContractFactory("License");
    const license = await License.deploy(await artwork.getAddress(), "https://api.veridiahub.com/license/");

    // Mint an artwork for testing
    await artwork.connect(creator).mintArtwork(WORK_HASH, "Test Art", "Description", "ipfs://test");

    return { license, artwork, owner, creator, buyer, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner and artwork contract", async function () {
      const { license, artwork, owner } = await loadFixture(deployContractsFixture);
      expect(await license.owner()).to.equal(owner.address);
      expect(await license.artworkContract()).to.equal(await artwork.getAddress());
    });

    it("Should have correct URI", async function () {
      const { license } = await loadFixture(deployContractsFixture);
      expect(await license.uri(1)).to.equal("https://api.veridiahub.com/license/1");
    });
  });

  describe("Single License Minting", function () {
    it("Should mint license successfully", async function () {
      const { license, artwork, creator, buyer } = await loadFixture(deployContractsFixture);

      const licenseId = 1;
      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      ))
        .to.emit(license, "LicenseMinted")
        .withArgs(licenseId, WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME);

      // Check balance
      expect(await license.balanceOf(creator.address, licenseId)).to.equal(100);

      // Check metadata
      const metadata = await license.getLicenseMetadata(licenseId);
      expect(metadata.workHash).to.equal(WORK_HASH);
      expect(metadata.price).to.equal(LICENSE_PRICE);
      expect(metadata.royalty).to.equal(ROYALTY_PERCENT);
      expect(metadata.termsURI).to.equal(TERMS_URI);
    });

    it("Should only allow creator to mint licenses", async function () {
      const { license, buyer } = await loadFixture(deployContractsFixture);

      await expect(license.connect(buyer).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      )).to.be.revertedWith("Only creator can mint license");
    });

    it("Should validate royalty percentage", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, 6000, EXPIRATION_TIME, TERMS_URI // 60% > 50%
      )).to.be.revertedWith("Royalty too high");
    });

    it("Should handle perpetual licenses", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, 0, TERMS_URI // 0 = perpetual
      );

      const licenseId = 1;
      expect(await license.isLicenseValid(licenseId)).to.be.true;
    });
  });

  describe("Batch License Minting", function () {
    it("Should batch mint multiple license types", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      const workHashes = [WORK_HASH, WORK_HASH, WORK_HASH];
      const amounts = [50, 75, 25];
      const prices = [LICENSE_PRICE, ethers.parseEther("2.0"), ethers.parseEther("0.5")];
      const royalties = [300, 500, 100]; // 3%, 5%, 1%
      const expirations = [EXPIRATION_TIME, EXPIRATION_TIME * 2, 0]; // Mix of expiring and perpetual
      const termsURIs = [TERMS_URI, "ipfs://terms2", "ipfs://terms3"];

      const tx = await license.connect(creator).batchMintLicense(
        workHashes, amounts, prices, royalties, expirations, termsURIs
      );

      // Check balances
      expect(await license.balanceOf(creator.address, 1)).to.equal(50);
      expect(await license.balanceOf(creator.address, 2)).to.equal(75);
      expect(await license.balanceOf(creator.address, 3)).to.equal(25);

      // Check metadata
      const metadata1 = await license.getLicenseMetadata(1);
      const metadata2 = await license.getLicenseMetadata(2);
      const metadata3 = await license.getLicenseMetadata(3);

      expect(metadata1.price).to.equal(LICENSE_PRICE);
      expect(metadata2.price).to.equal(ethers.parseEther("2.0"));
      expect(metadata3.price).to.equal(ethers.parseEther("0.5"));
    });

    it("Should revert on array length mismatch", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await expect(license.connect(creator).batchMintLicense(
        [WORK_HASH], [100, 50], [LICENSE_PRICE], [ROYALTY_PERCENT], [EXPIRATION_TIME], [TERMS_URI]
      )).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("License Expiration", function () {
    it("Should validate license expiration correctly", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      const shortExpiration = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, shortExpiration, TERMS_URI
      );

      const licenseId = 1;
      expect(await license.isLicenseValid(licenseId)).to.be.true;

      // Fast forward time past expiration
      await time.increase(shortExpiration + 1);

      expect(await license.isLicenseValid(licenseId)).to.be.false;
    });

    it("Should allow license renewal", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      const shortExpiration = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, shortExpiration, TERMS_URI
      );

      const licenseId = 1;
      const newExpiration = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now

      await expect(license.connect(creator).renewLicense(licenseId, newExpiration))
        .to.emit(license, "LicenseRenewed")
        .withArgs(licenseId, newExpiration);

      // Should be valid again
      expect(await license.isLicenseValid(licenseId)).to.be.true;
    });

    it("Should only allow creator to renew licenses", async function () {
      const { license, creator, buyer } = await loadFixture(deployContractsFixture);

      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      await expect(license.connect(buyer).renewLicense(1, Math.floor(Date.now() / 1000) + 7200))
        .to.be.revertedWith("Only creator can renew");
    });
  });

  describe("License Burning", function () {
    it("Should burn licenses correctly", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      const licenseId = 1;
      expect(await license.balanceOf(creator.address, licenseId)).to.equal(100);

      await expect(license.connect(creator).burnLicense(licenseId, 25))
        .to.emit(license, "LicenseBurned")
        .withArgs(licenseId, creator.address, 25);

      expect(await license.balanceOf(creator.address, licenseId)).to.equal(75);
    });

    it("Should prevent burning more than balance", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      await expect(license.connect(creator).burnLicense(1, 150))
        .to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Transfer Hooks and Validation", function () {
    it("Should prevent transfer of expired licenses", async function () {
      const { license, artwork, creator, buyer } = await loadFixture(deployContractsFixture);

      const workHash2 = ethers.keccak256(ethers.toUtf8Bytes("test artwork 2"));
      await artwork.connect(creator).mintArtwork(workHash2, "Test Art 2", "Description", "ipfs://test2");
      await license.connect(creator).mintLicense(
        workHash2, 100, LICENSE_PRICE, ROYALTY_PERCENT, Math.floor(Date.now() / 1000) + 3600, TERMS_URI // 1 hour expiration
      );

      // Transfer some licenses to buyer for testing
      await license.connect(creator).safeTransferFrom(creator.address, buyer.address, 1, 25, "0x");

      // Fast forward past expiration
      await time.increase(3700);

      // Attempt transfer should fail
      await expect(license.connect(buyer).safeTransferFrom(
        buyer.address, creator.address, 1, 10, "0x"
      )).to.be.revertedWith("License expired");
    });

    it("Should allow transfer of valid licenses", async function () {
      const { license, artwork, creator, buyer } = await loadFixture(deployContractsFixture);

      const workHash3 = ethers.keccak256(ethers.toUtf8Bytes("test artwork 3"));
      await artwork.connect(creator).mintArtwork(workHash3, "Test Art 3", "Description", "ipfs://test3");
      
      // Mint license and capture the event to get the license ID
      const tx = await license.connect(creator).mintLicense(
        workHash3, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
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

      // Check creator's balance before transfer
      const creatorBalance = await license.balanceOf(creator.address, licenseId);
      console.log("Creator balance:", creatorBalance.toString());
      console.log("License ID:", licenseId.toString());

      // Transfer some licenses to buyer for testing
      await license.connect(creator).safeTransferFrom(creator.address, buyer.address, licenseId, 25, "0x");

      await license.connect(buyer).safeTransferFrom(
        buyer.address, creator.address, licenseId, 10, "0x"
      );

      expect(await license.balanceOf(buyer.address, licenseId)).to.equal(15);
      expect(await license.balanceOf(creator.address, licenseId)).to.equal(85);
    });

    it("Should support batch transfers", async function () {
      const { license, artwork, marketplace, creator, buyer } = await loadFixture(deployContractsFixture);

      // Mint two license types
      const workHash4 = ethers.keccak256(ethers.toUtf8Bytes("test artwork 4"));
      await artwork.connect(creator).mintArtwork(workHash4, "Test Art 4", "Description", "ipfs://test4");
      await license.connect(creator).mintLicense(
        workHash4, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("artwork2"));
      await artwork.connect(creator).mintArtwork(hash2, "Art2", "Desc", "ipfs://2");
      await license.connect(creator).mintLicense(
        hash2, 50, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      // Transfer some licenses to buyer for testing
      await license.connect(creator).safeTransferFrom(creator.address, buyer.address, 1, 25, "0x");
      await license.connect(creator).safeTransferFrom(creator.address, buyer.address, 2, 10, "0x");

      await license.connect(buyer).safeBatchTransferFrom(
        buyer.address, creator.address, [1, 2], [10, 5], "0x"
      );

      expect(await license.balanceOf(buyer.address, 1)).to.equal(15);
      expect(await license.balanceOf(buyer.address, 2)).to.equal(5);
      expect(await license.balanceOf(creator.address, 1)).to.equal(85);
      expect(await license.balanceOf(creator.address, 2)).to.equal(45);
    });
  });

  describe("Pausable Functionality", function () {
    it("Should prevent minting when paused", async function () {
      const { license, owner, creator } = await loadFixture(deployContractsFixture);

      await license.connect(owner).pause();

      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      )).to.be.revertedWithCustomError(license, "EnforcedPause");
    });

    it("Should allow minting when unpaused", async function () {
      const { license, owner, creator } = await loadFixture(deployContractsFixture);

      await license.connect(owner).pause();
      await license.connect(owner).unpause();

      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      )).to.emit(license, "LicenseMinted");
    });
  });

  describe("ERC-1155 Compliance", function () {
    it("Should support balanceOf and balanceOfBatch", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      expect(await license.balanceOf(creator.address, 1)).to.equal(100);

      const balances = await license.balanceOfBatch([creator.address, creator.address], [1, 999]);
      expect(balances[0]).to.equal(100);
      expect(balances[1]).to.equal(0);
    });

    it("Should support approval system", async function () {
      const { license, artwork, marketplace, creator, buyer, user1 } = await loadFixture(deployContractsFixture);

      const workHash5 = ethers.keccak256(ethers.toUtf8Bytes("test artwork 5"));
      await artwork.connect(creator).mintArtwork(workHash5, "Test Art 5", "Description", "ipfs://test5");
      await license.connect(creator).mintLicense(
        workHash5, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      // Transfer some licenses to buyer for testing
      await license.connect(creator).safeTransferFrom(creator.address, buyer.address, 1, 25, "0x");

      // Set approval
      await license.connect(buyer).setApprovalForAll(user1.address, true);
      expect(await license.isApprovedForAll(buyer.address, user1.address)).to.be.true;

      // Approved user can transfer
      await license.connect(user1).safeTransferFrom(
        buyer.address, creator.address, 1, 10, "0x"
      );

      expect(await license.balanceOf(creator.address, 1)).to.equal(85);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should be more efficient with batch operations", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      // Batch mint 5 licenses
      const workHashes = Array(5).fill(WORK_HASH);
      const amounts = Array(5).fill(20);
      const prices = Array(5).fill(LICENSE_PRICE);
      const royalties = Array(5).fill(ROYALTY_PERCENT);
      const expirations = Array(5).fill(EXPIRATION_TIME);
      const termsURIs = Array(5).fill(TERMS_URI);

      const batchTx = await license.connect(creator).batchMintLicense(
        workHashes, amounts, prices, royalties, expirations, termsURIs
      );
      const batchReceipt = await batchTx.wait();
      const avgBatchGas = Number(batchReceipt.gasUsed) / 5;

      // Individual minting
      let totalIndividualGas = 0;
      for (let i = 0; i < 5; i++) {
        const tx = await license.connect(creator).mintLicense(
          WORK_HASH, 20, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
        );
        const receipt = await tx.wait();
        totalIndividualGas = totalIndividualGas + Number(receipt.gasUsed);
      }
      const avgIndividualGas = totalIndividualGas / 5;

      expect(avgBatchGas).to.be.lt(avgIndividualGas);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle zero amount minting", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 0, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      )).to.be.revertedWith("Amount zero");
    });

    it("Should handle zero price licenses", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 100, 0, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      )).to.emit(license, "LicenseMinted");
    });

    it("Should handle empty terms URI", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, ""
      )).to.emit(license, "LicenseMinted");
    });

    it("Should revert on non-existent artwork", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      await expect(license.connect(creator).mintLicense(
        fakeHash, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      )).to.be.revertedWith("Work not found");
    });
  });

  describe("Event Emissions", function () {
    it("Should emit correct events on minting", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await expect(license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      ))
        .to.emit(license, "LicenseMinted")
        .withArgs(1, WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME)
        .and.to.emit(license, "TransferSingle")
        .withArgs(creator.address, ethers.ZeroAddress, creator.address, 1, 100);
    });

    it("Should emit events on burning", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      await expect(license.connect(creator).burnLicense(1, 25))
        .to.emit(license, "LicenseBurned")
        .withArgs(1, creator.address, 25)
        .and.to.emit(license, "TransferSingle")
        .withArgs(creator.address, creator.address, ethers.ZeroAddress, 1, 25);
    });

    it("Should emit events on renewal", async function () {
      const { license, creator } = await loadFixture(deployContractsFixture);

      await license.connect(creator).mintLicense(
        WORK_HASH, 100, LICENSE_PRICE, ROYALTY_PERCENT, EXPIRATION_TIME, TERMS_URI
      );

      const newExpiration = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      await expect(license.connect(creator).renewLicense(1, newExpiration))
        .to.emit(license, "LicenseRenewed")
        .withArgs(1, newExpiration);
    });
  });
});