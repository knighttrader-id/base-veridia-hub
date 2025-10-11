const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentTokenManager", function () {
  let paymentTokenManager;
  let owner, user1, user2;
  let mockUSDC, mockUSDT, mockDAI, mockIDRX;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy PaymentTokenManager
    const PaymentTokenManager = await ethers.getContractFactory("PaymentTokenManager");
    paymentTokenManager = await PaymentTokenManager.deploy();
    await paymentTokenManager.waitForDeployment();

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
  });

  describe("Token Management", function () {
    it("Should add a token successfully", async function () {
      const tx = await paymentTokenManager.addToken(
        await mockUSDC.getAddress(),
        "USDC",
        6
      );
      await tx.wait();

      const tokenInfo = await paymentTokenManager.getTokenInfo(await mockUSDC.getAddress());
      expect(tokenInfo.symbol).to.equal("USDC");
      expect(tokenInfo.decimals).to.equal(6);
      expect(tokenInfo.isActive).to.be.true;

      const isSupported = await paymentTokenManager.isTokenSupported(await mockUSDC.getAddress());
      expect(isSupported).to.be.true;
    });

    it("Should emit TokenAdded event", async function () {
      await expect(paymentTokenManager.addToken(
        await mockUSDC.getAddress(),
        "USDC",
        6
      )).to.emit(paymentTokenManager, "TokenAdded")
        .withArgs(await mockUSDC.getAddress(), "USDC", 6);
    });

    it("Should reject adding invalid token address", async function () {
      await expect(paymentTokenManager.addToken(
        ethers.ZeroAddress,
        "INVALID",
        18
      )).to.be.revertedWith("Invalid token address");
    });

    it("Should reject adding token with empty symbol", async function () {
      await expect(paymentTokenManager.addToken(
        await mockUSDC.getAddress(),
        "",
        6
      )).to.be.revertedWith("Invalid symbol");
    });

    it("Should reject adding token with invalid decimals", async function () {
      await expect(paymentTokenManager.addToken(
        await mockUSDC.getAddress(),
        "USDC",
        19
      )).to.be.revertedWith("Invalid decimals");
    });

    it("Should reject adding duplicate token", async function () {
      await paymentTokenManager.addToken(await mockUSDC.getAddress(), "USDC", 6);
      
      await expect(paymentTokenManager.addToken(
        await mockUSDC.getAddress(),
        "USDC",
        6
      )).to.be.revertedWith("Token already supported");
    });

    it("Should reject adding invalid token contract", async function () {
      // Create a contract that doesn't implement ERC20 properly
      const InvalidContract = await ethers.getContractFactory("InvalidContract");
      const invalidContract = await InvalidContract.deploy();
      await invalidContract.waitForDeployment();
      
      await expect(paymentTokenManager.addToken(
        await invalidContract.getAddress(),
        "INVALID",
        18
      )).to.be.revertedWith("Invalid token contract");
    });
  });

  describe("Token Removal", function () {
    beforeEach(async function () {
      await paymentTokenManager.addToken(await mockUSDC.getAddress(), "USDC", 6);
      await paymentTokenManager.addToken(await mockUSDT.getAddress(), "USDT", 6);
    });

    it("Should remove token successfully", async function () {
      const tx = await paymentTokenManager.removeToken(await mockUSDC.getAddress());
      await tx.wait();

      const isSupported = await paymentTokenManager.isTokenSupported(await mockUSDC.getAddress());
      expect(isSupported).to.be.false;

      const tokenInfo = await paymentTokenManager.getTokenInfo(await mockUSDC.getAddress());
      expect(tokenInfo.isActive).to.be.false;
    });

    it("Should emit TokenRemoved event", async function () {
      await expect(paymentTokenManager.removeToken(await mockUSDC.getAddress()))
        .to.emit(paymentTokenManager, "TokenRemoved")
        .withArgs(await mockUSDC.getAddress());
    });

    it("Should reject removing non-existent token", async function () {
      await expect(paymentTokenManager.removeToken(user1.address))
        .to.be.revertedWith("Token not supported");
    });
  });

  describe("Token Status Management", function () {
    beforeEach(async function () {
      await paymentTokenManager.addToken(await mockUSDC.getAddress(), "USDC", 6);
    });

    it("Should change token status successfully", async function () {
      await paymentTokenManager.setTokenStatus(await mockUSDC.getAddress(), false);
      
      const isSupported = await paymentTokenManager.isTokenSupported(await mockUSDC.getAddress());
      expect(isSupported).to.be.false;

      await paymentTokenManager.setTokenStatus(await mockUSDC.getAddress(), true);
      
      const isSupportedAgain = await paymentTokenManager.isTokenSupported(await mockUSDC.getAddress());
      expect(isSupportedAgain).to.be.true;
    });

    it("Should emit TokenStatusChanged event", async function () {
      await expect(paymentTokenManager.setTokenStatus(await mockUSDC.getAddress(), false))
        .to.emit(paymentTokenManager, "TokenStatusChanged")
        .withArgs(await mockUSDC.getAddress(), false);
    });

    it("Should reject changing status of non-existent token", async function () {
      await expect(paymentTokenManager.setTokenStatus(user1.address, false))
        .to.be.revertedWith("Token not found");
    });
  });

  describe("Batch Operations", function () {
    it("Should add multiple tokens in batch", async function () {
      const tokenAddresses = [
        await mockUSDC.getAddress(),
        await mockUSDT.getAddress(),
        await mockDAI.getAddress()
      ];
      const symbols = ["USDC", "USDT", "DAI"];
      const decimals = [6, 6, 18];

      await paymentTokenManager.batchAddTokens(tokenAddresses, symbols, decimals);

      for (let i = 0; i < tokenAddresses.length; i++) {
        const isSupported = await paymentTokenManager.isTokenSupported(tokenAddresses[i]);
        expect(isSupported).to.be.true;
      }
    });

    it("Should reject batch add with mismatched array lengths", async function () {
      const tokenAddresses = [await mockUSDC.getAddress()];
      const symbols = ["USDC", "USDT"]; // Different length
      const decimals = [6];

      await expect(paymentTokenManager.batchAddTokens(tokenAddresses, symbols, decimals))
        .to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await paymentTokenManager.addToken(await mockUSDC.getAddress(), "USDC", 6);
      await paymentTokenManager.addToken(await mockUSDT.getAddress(), "USDT", 6);
      await paymentTokenManager.addToken(await mockDAI.getAddress(), "DAI", 18);
    });

    it("Should return all supported tokens", async function () {
      const supportedTokens = await paymentTokenManager.getAllSupportedTokens();
      expect(supportedTokens).to.have.lengthOf(3);
    });

    it("Should return correct token count", async function () {
      const count = await paymentTokenManager.getSupportedTokenCount();
      expect(count).to.equal(3);
    });

    it("Should return token by index", async function () {
      const [tokenAddress, tokenInfo] = await paymentTokenManager.getTokenByIndex(0);
      expect(tokenInfo.symbol).to.be.oneOf(["USDC", "USDT", "DAI"]);
    });

    it("Should reject getting token by invalid index", async function () {
      await expect(paymentTokenManager.getTokenByIndex(10))
        .to.be.revertedWith("Index out of bounds");
    });
  });

  describe("Access Control", function () {
    it("Should reject non-owner from adding token", async function () {
      await expect(paymentTokenManager.connect(user1).addToken(
        await mockUSDC.getAddress(),
        "USDC",
        6
      )).to.be.revertedWithCustomError(paymentTokenManager, "OwnableUnauthorizedAccount");
    });

    it("Should reject non-owner from removing token", async function () {
      await paymentTokenManager.addToken(await mockUSDC.getAddress(), "USDC", 6);
      
      await expect(paymentTokenManager.connect(user1).removeToken(await mockUSDC.getAddress()))
        .to.be.revertedWithCustomError(paymentTokenManager, "OwnableUnauthorizedAccount");
    });

    it("Should reject non-owner from changing token status", async function () {
      await paymentTokenManager.addToken(await mockUSDC.getAddress(), "USDC", 6);
      
      await expect(paymentTokenManager.connect(user1).setTokenStatus(await mockUSDC.getAddress(), false))
        .to.be.revertedWithCustomError(paymentTokenManager, "OwnableUnauthorizedAccount");
    });
  });
});
