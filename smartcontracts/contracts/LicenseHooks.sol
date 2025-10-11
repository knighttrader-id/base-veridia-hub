// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LicenseHooks
 * @dev Transfer hooks for license validation
 * Implements validation logic that can be checked before license transfers
 */
abstract contract LicenseHooks {
    /**
     * @dev Hook called before any license transfer
     * Override this in License.sol to add custom validation
     * @param operator Address performing the transfer
     * @param from Address sending tokens
     * @param to Address receiving tokens
     * @param id Token ID being transferred
     * @param amount Number of tokens being transferred
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) internal virtual {
        // Check if license is expired
        require(_isLicenseValidForTransfer(id), "License expired or invalid");
        
        // Additional validations can be added here
        if (to == address(0)) {
            // Burning - no additional validation needed
            return;
        }
        
        if (from == address(0)) {
            // Minting - no additional validation needed
            return;
        }
        
        // For regular transfers, ensure license is transferable
        require(_isLicenseTransferable(id), "License not transferable");
    }

    /**
     * @dev Check if license is valid for transfer
     * @param licenseId License token ID
     * @return True if license is valid
     */
    function _isLicenseValidForTransfer(uint256 licenseId) internal view virtual returns (bool);

    /**
     * @dev Check if license can be transferred
     * @param licenseId License token ID
     * @return True if license is transferable
     */
    function _isLicenseTransferable(uint256 licenseId) internal view virtual returns (bool) {
        // Default: all licenses are transferable
        // Override in License.sol to add specific rules
        return true;
    }

    /**
     * @dev Hook called after any license transfer
     * @param operator Address performing the transfer
     * @param from Address sending tokens
     * @param to Address receiving tokens
     * @param id Token ID being transferred
     * @param amount Number of tokens being transferred
     */
    function _afterTokenTransfer(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) internal virtual {
        // Post-transfer logic (e.g., update analytics)
    }
}