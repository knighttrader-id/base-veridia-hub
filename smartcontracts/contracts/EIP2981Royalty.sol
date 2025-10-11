// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title EIP2981Royalty
 * @dev Implements EIP-2981 NFT Royalty Standard for secondary sales
 * Enforces royalty payments on all secondary marketplace transactions
 */
abstract contract EIP2981Royalty is IERC2981 {
    struct RoyaltyInfo {
        address receiver;
        uint96 royaltyFraction; // Basis points (10000 = 100%)
    }

    // tokenId => RoyaltyInfo
    mapping(uint256 => RoyaltyInfo) private _tokenRoyalties;
    
    // Default royalty for all tokens
    RoyaltyInfo private _defaultRoyalty;

    /**
     * @dev Set default royalty for all tokens
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty percentage in basis points
     */
    function _setDefaultRoyalty(address receiver, uint96 feeNumerator) internal virtual {
        require(feeNumerator <= 10000, "Royalty too high");
        require(receiver != address(0), "Invalid receiver");
        
        _defaultRoyalty = RoyaltyInfo(receiver, feeNumerator);
    }

    /**
     * @dev Set royalty for specific token
     * @param tokenId Token ID
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty percentage in basis points
     */
    function _setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) internal virtual {
        require(feeNumerator <= 10000, "Royalty too high");
        require(receiver != address(0), "Invalid receiver");
        
        _tokenRoyalties[tokenId] = RoyaltyInfo(receiver, feeNumerator);
    }

    /**
     * @dev Reset royalty for specific token to default
     * @param tokenId Token ID
     */
    function _resetTokenRoyalty(uint256 tokenId) internal virtual {
        delete _tokenRoyalties[tokenId];
    }

    /**
     * @inheritdoc IERC2981
     * @dev Returns royalty info for a token at a given sale price
     * @param tokenId Token ID being sold
     * @param salePrice Sale price in wei
     * @return receiver Address to receive royalty payment
     * @return royaltyAmount Amount of royalty to pay
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        public
        view
        virtual
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];

        if (royalty.receiver == address(0)) {
            royalty = _defaultRoyalty;
        }

        royaltyAmount = (salePrice * royalty.royaltyFraction) / 10000;
        receiver = royalty.receiver;
    }

    /**
     * @dev Get royalty percentage for a token
     * @param tokenId Token ID
     * @return Royalty percentage in basis points
     */
    function getRoyaltyPercentage(uint256 tokenId) public view returns (uint256) {
        RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];
        
        if (royalty.receiver == address(0)) {
            return _defaultRoyalty.royaltyFraction;
        }
        
        return royalty.royaltyFraction;
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        returns (bool) 
    {
        return interfaceId == type(IERC2981).interfaceId;
    }
}