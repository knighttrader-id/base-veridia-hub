// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMarketplace {
    function buyLicense(uint256 licenseId, uint256 amount) external payable;
}

contract MaliciousBuyer {
    IMarketplace public marketplace;
    uint256 public attackCount;
    
    constructor(address _marketplace) {
        marketplace = IMarketplace(_marketplace);
    }
    
    function attack(uint256 licenseId, uint256 amount) external payable {
        attackCount++;
        if (attackCount < 3) {
            // Attempt reentrancy - use all available balance
            marketplace.buyLicense{value: address(this).balance}(licenseId, amount);
        }
    }
    
    receive() external payable {
        // This will be called during the reentrancy attempt
    }
}
