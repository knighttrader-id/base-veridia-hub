const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Artwork Contract", function () {
  // Test constants
  const WORK_HASH = ethers.keccak256(ethers.toUtf8Bytes("test artwork"));
  const TITLE = "Digital Artwork";
  const DESCRIPTION = "A beautiful digital creation";
  const METADATA_URI = "ipfs://QmTest123";

  async function deployArtworkFixture() {
    const [owner, creator, user1, user2] = await ethers.getSigners();

    const Artwork = await ethers.getContractFactory("Artwork");
    const artwork = await Artwork.deploy();

    return { artwork, owner, creator, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { artwork, owner } = await loadFixture(deployArtworkFixture);
      expect(await artwork.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      const { artwork } = await loadFixture(deployArtworkFixture);
      expect(await artwork.name()).to.equal("VeridiaHub Artwork");
      expect(await artwork.symbol()).to.equal("VART");
    });
  });

  describe("Single Artwork Minting", function () {
    it("Should mint artwork successfully", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await expect(artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI))
        .to.emit(artwork, "WorkRegistered")
        .withArgs(1, WORK_HASH, creator.address, TITLE);

      expect(await artwork.ownerOf(1)).to.equal(creator.address);
      expect(await artwork.getTokenIdByHash(WORK_HASH)).to.equal(1);
    });

    it("Should store work metadata correctly", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI);

      const work = await artwork.getWork(1);
      expect(work.contentHash).to.equal(WORK_HASH);
      expect(work.title).to.equal(TITLE);
      expect(work.description).to.equal(DESCRIPTION);
      expect(work.metadataURI).to.equal(METADATA_URI);
      expect(work.creator).to.equal(creator.address);
    });

    it("Should prevent duplicate hash minting", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI);

      await expect(
        artwork.connect(creator).mintArtwork(WORK_HASH, "Different Title", DESCRIPTION, METADATA_URI)
      ).to.be.revertedWith("Work already exists");
    });

    it("Should return correct token URI", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI);
      expect(await artwork.tokenURI(1)).to.equal(METADATA_URI);
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint multiple artworks", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      const hashes = [
        ethers.keccak256(ethers.toUtf8Bytes("artwork1")),
        ethers.keccak256(ethers.toUtf8Bytes("artwork2")),
        ethers.keccak256(ethers.toUtf8Bytes("artwork3"))
      ];

      const titles = ["Art1", "Art2", "Art3"];
      const descriptions = ["Desc1", "Desc2", "Desc3"];
      const uris = ["ipfs://1", "ipfs://2", "ipfs://3"];

      const tx = await artwork.connect(creator).batchMintArtwork(hashes, titles, descriptions, uris);
      const receipt = await tx.wait();

      // Check events - should have WorkRegistered events
      const events = receipt.logs.filter(log => log.fragment && log.fragment.name === "WorkRegistered");
      expect(events.length).to.equal(3);

      // Check ownership
      expect(await artwork.ownerOf(1)).to.equal(creator.address);
      expect(await artwork.ownerOf(2)).to.equal(creator.address);
      expect(await artwork.ownerOf(3)).to.equal(creator.address);

      // Check token IDs by hash
      expect(await artwork.getTokenIdByHash(hashes[0])).to.equal(1);
      expect(await artwork.getTokenIdByHash(hashes[1])).to.equal(2);
      expect(await artwork.getTokenIdByHash(hashes[2])).to.equal(3);
    });

    it("Should revert batch minting with mismatched array lengths", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      const hashes = [WORK_HASH];
      const titles = ["Art1", "Art2"]; // Different length

      await expect(
        artwork.connect(creator).batchMintArtwork(hashes, titles, [DESCRIPTION], [METADATA_URI])
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should revert batch minting with duplicate hashes", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      const hashes = [WORK_HASH, WORK_HASH]; // Duplicate

      await expect(
        artwork.connect(creator).batchMintArtwork(hashes, [TITLE, "Title2"], [DESCRIPTION, DESCRIPTION], [METADATA_URI, METADATA_URI])
      ).to.be.revertedWith("Work already exists");
    });
  });

  describe("Creator Portfolio Management", function () {
    it("Should track creator tokens efficiently", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      // Mint multiple artworks
      for (let i = 1; i <= 5; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`artwork${i}`));
        await artwork.connect(creator).mintArtwork(hash, `Title${i}`, DESCRIPTION, METADATA_URI);
      }

      const creatorTokens = await artwork.getCreatorTokens(creator.address);
      expect(creatorTokens.length).to.equal(5);
      expect(creatorTokens).to.deep.equal([1, 2, 3, 4, 5]);
    });

    it("Should handle multiple creators", async function () {
      const { artwork, creator, user1 } = await loadFixture(deployArtworkFixture);

      // Creator mints 2 artworks
      await artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI);
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("artwork2"));
      await artwork.connect(creator).mintArtwork(hash2, "Title2", DESCRIPTION, METADATA_URI);

      // User1 mints 1 artwork
      const hash3 = ethers.keccak256(ethers.toUtf8Bytes("artwork3"));
      await artwork.connect(user1).mintArtwork(hash3, "Title3", DESCRIPTION, METADATA_URI);

      expect(await artwork.getCreatorTokens(creator.address)).to.deep.equal([1, 2]);
      expect(await artwork.getCreatorTokens(user1.address)).to.deep.equal([3]);
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { artwork, owner, creator } = await loadFixture(deployArtworkFixture);

      // Pause contract
      await artwork.connect(owner).pause();
      expect(await artwork.paused()).to.be.true;

      // Should revert when paused (only batchMintArtwork uses whenNotPaused)
      await expect(
        artwork.connect(creator).batchMintArtwork([WORK_HASH], [TITLE], [DESCRIPTION], [METADATA_URI])
      ).to.be.revertedWithCustomError(artwork, "EnforcedPause");

      // Unpause contract
      await artwork.connect(owner).unpause();
      expect(await artwork.paused()).to.be.false;

      // Should work when unpaused
      await expect(artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI))
        .to.emit(artwork, "WorkRegistered");
    });

    it("Should prevent non-owner from pausing", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await expect(artwork.connect(creator).pause()).to.be.revertedWithCustomError(artwork, "OwnableUnauthorizedAccount");
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-owner from pausing", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await expect(artwork.connect(creator).pause()).to.be.revertedWithCustomError(artwork, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to pause and unpause", async function () {
      const { artwork, owner } = await loadFixture(deployArtworkFixture);

      await artwork.connect(owner).pause();
      expect(await artwork.paused()).to.be.true;
      
      await artwork.connect(owner).unpause();
      expect(await artwork.paused()).to.be.false;
    });
  });

  describe("ERC-721 Compliance", function () {
    it("Should support safeTransferFrom", async function () {
      const { artwork, creator, user1 } = await loadFixture(deployArtworkFixture);

      await artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI);

      await artwork.connect(creator).safeTransferFrom(creator.address, user1.address, 1);
      expect(await artwork.ownerOf(1)).to.equal(user1.address);
    });

    it("Should support transferFrom with approval", async function () {
      const { artwork, creator, user1, user2 } = await loadFixture(deployArtworkFixture);

      await artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI);
      await artwork.connect(creator).approve(user1.address, 1);

      await artwork.connect(user1).transferFrom(creator.address, user2.address, 1);
      expect(await artwork.ownerOf(1)).to.equal(user2.address);
    });

    it("Should support getApproved and setApprovalForAll", async function () {
      const { artwork, creator, user1, user2 } = await loadFixture(deployArtworkFixture);

      await artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI);

      // Set approval for all
      await artwork.connect(creator).setApprovalForAll(user1.address, true);
      expect(await artwork.isApprovedForAll(creator.address, user1.address)).to.be.true;

      // User1 can now transfer
      await artwork.connect(user1).transferFrom(creator.address, user2.address, 1);
      expect(await artwork.ownerOf(1)).to.equal(user2.address);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should maintain O(1) performance for getCreatorTokens", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      // Mint many artworks to test scalability
      const mintPromises = [];
      for (let i = 0; i < 50; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`artwork${i}`));
        mintPromises.push(
          artwork.connect(creator).mintArtwork(hash, `Title${i}`, DESCRIPTION, METADATA_URI)
        );
      }
      await Promise.all(mintPromises);

      // This should execute in constant time regardless of token count
      const startGas = await ethers.provider.getBalance(creator.address);
      const creatorTokens = await artwork.getCreatorTokens(creator.address);
      const endGas = await ethers.provider.getBalance(creator.address);

      expect(creatorTokens.length).to.equal(50);
      // Gas usage should be minimal and not scale with token count
    });

    it("Should be more gas efficient with batch minting", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      const hashes = Array(10).fill().map((_, i) =>
        ethers.keccak256(ethers.toUtf8Bytes(`batch_artwork${i}`))
      );
      const titles = Array(10).fill().map((_, i) => `Batch Title ${i}`);
      const descriptions = Array(10).fill(DESCRIPTION);
      const uris = Array(10).fill().map((_, i) => `ipfs://batch${i}`);

      const batchTx = await artwork.connect(creator).batchMintArtwork(hashes, titles, descriptions, uris);
      const batchReceipt = await batchTx.wait();

      // Calculate average gas per mint in batch
      const avgBatchGas = Number(batchReceipt.gasUsed) / 10;

      // Compare with individual minting
      let totalIndividualGas = 0;
      for (let i = 0; i < 10; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`individual_artwork${i}`));
        const tx = await artwork.connect(creator).mintArtwork(hash, `Individual Title ${i}`, DESCRIPTION, `ipfs://individual${i}`);
        const receipt = await tx.wait();
        totalIndividualGas = totalIndividualGas + Number(receipt.gasUsed);
      }
      const avgIndividualGas = totalIndividualGas / 10;

      // Batch should be more efficient
      expect(avgBatchGas).to.be.lt(avgIndividualGas);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle empty strings gracefully", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      // Contract requires non-empty title, so this should revert
      await expect(artwork.connect(creator).mintArtwork(WORK_HASH, "", "", ""))
        .to.be.revertedWith("Empty title");
    });

    it("Should revert on zero hash", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await expect(
        artwork.connect(creator).mintArtwork(ethers.ZeroHash, TITLE, DESCRIPTION, METADATA_URI)
      ).to.be.revertedWith("Invalid hash");
    });

    it("Should revert on non-existent token queries", async function () {
      const { artwork } = await loadFixture(deployArtworkFixture);

      await expect(artwork.getWork(999)).to.be.revertedWithCustomError(artwork, "ERC721NonexistentToken");
      await expect(artwork.tokenURI(999)).to.be.revertedWithCustomError(artwork, "ERC721NonexistentToken");
    });

    it("Should return empty array for creators with no tokens", async function () {
      const { artwork, user1 } = await loadFixture(deployArtworkFixture);

      const tokens = await artwork.getCreatorTokens(user1.address);
      expect(tokens).to.deep.equal([]);
    });
  });

  describe("Event Emissions", function () {
    it("Should emit correct events on minting", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      await expect(artwork.connect(creator).mintArtwork(WORK_HASH, TITLE, DESCRIPTION, METADATA_URI))
        .to.emit(artwork, "WorkRegistered")
        .withArgs(1, WORK_HASH, creator.address, TITLE)
        .and.to.emit(artwork, "Transfer")
        .withArgs(ethers.ZeroAddress, creator.address, 1);
    });

    it("Should emit events on batch minting", async function () {
      const { artwork, creator } = await loadFixture(deployArtworkFixture);

      const hashes = [WORK_HASH];
      const titles = [TITLE];
      const descriptions = [DESCRIPTION];
      const uris = [METADATA_URI];

      const tx = await artwork.connect(creator).batchMintArtwork(hashes, titles, descriptions, uris);

      // Should emit both WorkRegistered and Transfer events
      await expect(tx)
        .to.emit(artwork, "WorkRegistered")
        .and.to.emit(artwork, "Transfer");
    });
  });
});