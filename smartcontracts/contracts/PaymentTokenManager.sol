// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PaymentTokenManager
 * @dev Manages whitelist of accepted payment tokens for the marketplace
 */
contract PaymentTokenManager is Ownable {
    
    struct TokenInfo {
        address tokenAddress;
        string symbol;
        uint8 decimals;
        bool isActive;
    }
    
    // Mapping of token address to token info
    mapping(address => TokenInfo) public supportedTokens;
    
    // Array of all supported token addresses
    address[] public tokenList;
    
    // Events
    event TokenAdded(address indexed token, string symbol, uint8 decimals);
    event TokenRemoved(address indexed token);
    event TokenStatusChanged(address indexed token, bool isActive);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Add a new payment token to the whitelist
     * @param tokenAddress Address of the ERC20 token
     * @param symbol Token symbol (e.g., "USDC")
     * @param decimals Token decimals (e.g., 6 for USDC)
     */
    function addToken(
        address tokenAddress,
        string calldata symbol,
        uint8 decimals
    ) external onlyOwner {
        _addToken(tokenAddress, symbol, decimals);
    }
    
    /**
     * @notice Remove a token from the whitelist
     * @param tokenAddress Address of the token to remove
     */
    function removeToken(address tokenAddress) external onlyOwner {
        require(supportedTokens[tokenAddress].isActive, "Token not supported");
        
        supportedTokens[tokenAddress].isActive = false;
        
        // Remove from tokenList array
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == tokenAddress) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
        
        emit TokenRemoved(tokenAddress);
    }
    
    /**
     * @notice Enable or disable a token without removing it
     * @param tokenAddress Address of the token
     * @param isActive New status
     */
    function setTokenStatus(address tokenAddress, bool isActive) external onlyOwner {
        require(supportedTokens[tokenAddress].tokenAddress != address(0), "Token not found");
        
        supportedTokens[tokenAddress].isActive = isActive;
        
        emit TokenStatusChanged(tokenAddress, isActive);
    }
    
    /**
     * @notice Check if a token is supported and active
     * @param tokenAddress Address of the token to check
     * @return isSupported True if token is supported and active
     */
    function isTokenSupported(address tokenAddress) external view returns (bool isSupported) {
        return supportedTokens[tokenAddress].isActive;
    }
    
    /**
     * @notice Get token information
     * @param tokenAddress Address of the token
     * @return tokenInfo Token information struct
     */
    function getTokenInfo(address tokenAddress) external view returns (TokenInfo memory tokenInfo) {
        return supportedTokens[tokenAddress];
    }
    
    /**
     * @notice Get all supported token addresses
     * @return addresses Array of supported token addresses
     */
    function getAllSupportedTokens() external view returns (address[] memory addresses) {
        return tokenList;
    }
    
    /**
     * @notice Get count of supported tokens
     * @return count Number of supported tokens
     */
    function getSupportedTokenCount() external view returns (uint256 count) {
        return tokenList.length;
    }
    
    /**
     * @notice Get token info by index
     * @param index Index in the tokenList array
     * @return tokenAddress Address of the token
     * @return tokenInfo Token information
     */
    function getTokenByIndex(uint256 index) external view returns (address tokenAddress, TokenInfo memory tokenInfo) {
        require(index < tokenList.length, "Index out of bounds");
        
        tokenAddress = tokenList[index];
        tokenInfo = supportedTokens[tokenAddress];
    }
    
    /**
     * @notice Batch add multiple tokens
     * @param tokenAddresses Array of token addresses
     * @param symbols Array of token symbols
     * @param decimalsArray Array of token decimals
     */
    function batchAddTokens(
        address[] calldata tokenAddresses,
        string[] calldata symbols,
        uint8[] calldata decimalsArray
    ) external onlyOwner {
        require(
            tokenAddresses.length == symbols.length && 
            symbols.length == decimalsArray.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            _addToken(tokenAddresses[i], symbols[i], decimalsArray[i]);
        }
    }

    /**
     * @notice Internal function to add a token
     * @param tokenAddress Address of the ERC20 token
     * @param symbol Token symbol
     * @param decimals Token decimals
     */
    function _addToken(
        address tokenAddress,
        string calldata symbol,
        uint8 decimals
    ) internal {
        require(tokenAddress != address(0), "Invalid token address");
        require(bytes(symbol).length > 0, "Invalid symbol");
        require(decimals <= 18, "Invalid decimals");
        require(!supportedTokens[tokenAddress].isActive, "Token already supported");
        
        // Verify the token contract exists by calling a view function
        try IERC20(tokenAddress).totalSupply() returns (uint256) {
            // Token contract exists
        } catch {
            revert("Invalid token contract");
        }
        
        supportedTokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            symbol: symbol,
            decimals: decimals,
            isActive: true
        });
        
        tokenList.push(tokenAddress);
        
        emit TokenAdded(tokenAddress, symbol, decimals);
    }
}
