// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev Mock ERC20 tokens for testing multi-token payment system
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @notice Mint tokens to any address (for testing)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @notice Mint tokens to caller (for testing)
     * @param amount Amount of tokens to mint
     */
    function mint(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing
 */
contract MockUSDC is MockERC20 {
    constructor() MockERC20("USD Coin", "USDC", 6, 1000000 * 10**6) {}
}

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing
 */
contract MockUSDT is MockERC20 {
    constructor() MockERC20("Tether USD", "USDT", 6, 1000000 * 10**6) {}
}

/**
 * @title MockDAI
 * @dev Mock DAI token for testing
 */
contract MockDAI is MockERC20 {
    constructor() MockERC20("Dai Stablecoin", "DAI", 18, 1000000 * 10**18) {}
}

/**
 * @title MockIDRX
 * @dev Mock IDRX token for testing
 */
contract MockIDRX is MockERC20 {
    constructor() MockERC20("Indonesian Rupiah", "IDRX", 6, 1000000 * 10**6) {}
}

/**
 * @title InvalidContract
 * @dev Invalid contract that doesn't implement ERC20 properly
 */
contract InvalidContract {
    // This contract doesn't implement totalSupply() or any ERC20 functions
    // It will cause the PaymentTokenManager to revert when trying to verify it
}
