// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./PaymentTokenManager.sol";

interface ILicense {
    function licensePrice(uint256 licenseId) external view returns (uint256);
    function licenseRoyalty(uint256 licenseId) external view returns (uint256);
    function getWorkHash(uint256 licenseId) external view returns (bytes32);
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

interface IArtworkForMarket {
    function getTokenIdByHash(bytes32 _contentHash) external view returns (uint256);
    function getWork(uint256 tokenId)
        external
        view
        returns (
            bytes32 contentHash,
            address creator,
            string memory title,
            string memory description,
            uint256 timestamp,
            string memory metadataURI
        );
}

/**
 * Marketplace.sol
 * - Holds license tokens in custody and sells them
 * - Implements fee distribution: royalty (to creator), platformFee, nationalContribution
 * - Keeps creator accumulated balances for withdrawal
 * - Allows platform and national withdrawals
 */
contract Marketplace is ReentrancyGuard, Ownable, Pausable, IERC1155Receiver {
    using SafeERC20 for IERC20;
    
    ILicense public licenseContract;
    IArtworkForMarket public artworkContract;
    PaymentTokenManager public paymentTokenManager;

    address public platformWallet;
    address public nationalFund;

    uint256 public constant PLATFORM_BP = 400; // 4%
    uint256 public constant NATIONAL_BP = 100; // 1%

    // ETH balances (existing)
    mapping(address => uint256) public creatorBalances;
    uint256 public platformBalance;
    uint256 public nationalBalance;
    
    // ERC20 token balances
    mapping(address => mapping(address => uint256)) public creatorTokenBalances; // creator => token => balance
    mapping(address => uint256) public platformTokenBalances; // token => balance
    mapping(address => uint256) public nationalTokenBalances; // token => balance

    // Analytics tracking
    mapping(uint256 => uint256) public totalSales; // licenseId => total units sold
    mapping(address => uint256) public creatorRevenue; // creator => lifetime earnings
    uint256 public totalVolume; // Total wei transacted

    // Listing tracking
    struct Listing {
        uint256 licenseId;
        address seller;
        uint256 amount;
        uint256 price;
        uint256 listedAt;
        bool active;
    }
    mapping(uint256 => Listing) public listings; // licenseId => Listing info

    event LicensePurchased(uint256 indexed licenseId, address indexed buyer, uint256 pricePaid, uint256 amount, address paymentToken);
    event BatchPurchaseCompleted(address indexed buyer, uint256[] licenseIds, uint256[] amounts, uint256 totalCost, address paymentToken);
    event EarningsWithdrawn(address indexed recipient, uint256 amount, address token);
    event PlatformWithdrawn(address indexed to, uint256 amount, address token);
    event NationalWithdrawn(address indexed to, uint256 amount, address token);
    event LicenseListed(uint256 indexed licenseId, address indexed seller, uint256 amount, uint256 price);
    event ListingCancelled(uint256 indexed licenseId, address indexed seller);
    event PriceUpdated(uint256 indexed licenseId, uint256 newPrice);

    constructor(
        address _artworkContract, 
        address _licenseContract, 
        address _platformWallet, 
        address _nationalFund,
        address _paymentTokenManager
    ) Ownable(msg.sender) {
        require(_artworkContract != address(0) && _licenseContract != address(0) && _platformWallet != address(0) && _nationalFund != address(0) && _paymentTokenManager != address(0), "Invalid address");
        artworkContract = IArtworkForMarket(_artworkContract);
        licenseContract = ILicense(_licenseContract);
        platformWallet = _platformWallet;
        nationalFund = _nationalFund;
        paymentTokenManager = PaymentTokenManager(_paymentTokenManager);
    }

    /**
     * @notice List license tokens for sale on marketplace
     * @dev Creator mints licenses and transfers to marketplace in one step
     */
    function listLicense(
        uint256 _licenseId,
        uint256 _amount,
        uint256 _price
    ) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount zero");
        require(_price > 0, "Price zero");
        
        // Check that the caller owns the license tokens
        require(licenseContract.balanceOf(msg.sender, _licenseId) >= _amount, "Insufficient license balance");
        
        // Transfer license tokens to marketplace
        licenseContract.safeTransferFrom(msg.sender, address(this), _licenseId, _amount, "");
        
        // Store the listing
        listings[_licenseId] = Listing({
            licenseId: _licenseId,
            seller: msg.sender,
            amount: _amount,
            price: _price,
            listedAt: block.timestamp,
            active: true
        });
        
        emit LicenseListed(_licenseId, msg.sender, _amount, _price);
    }

    /**
     * @notice Buy license with ETH payment (legacy function)
     * @dev Enhanced with analytics tracking
     */
    function buyLicense(uint256 licenseId, uint256 amount) external payable nonReentrant whenNotPaused {
        require(amount > 0, "Amount zero");

        uint256 pricePerUnit = licenseContract.licensePrice(licenseId);
        require(pricePerUnit > 0, "License not for sale");

        uint256 marketBalance = licenseContract.balanceOf(address(this), licenseId);
        require(marketBalance >= amount, "Insufficient marketplace supply");

        uint256 totalPrice = pricePerUnit * amount;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Process the purchase using helper function
        _processPurchase(licenseId, amount, address(0));

        // Handle refund if overpaid
        if (msg.value > totalPrice) {
            unchecked {
                uint256 refund = msg.value - totalPrice;
                (bool rc, ) = msg.sender.call{value: refund}("");
                require(rc, "Refund failed");
            }
        }
    }

    /**
     * @notice Buy license with multi-token payment support
     * @dev Supports both ETH (address(0)) and ERC20 tokens
     */
    function buyLicenseWithToken(uint256 licenseId, uint256 amount, address paymentToken) external payable nonReentrant whenNotPaused {
        require(amount > 0, "Amount zero");

        uint256 pricePerUnit = licenseContract.licensePrice(licenseId);
        require(pricePerUnit > 0, "License not for sale");

        uint256 marketBalance = licenseContract.balanceOf(address(this), licenseId);
        require(marketBalance >= amount, "Insufficient marketplace supply");

        uint256 totalPrice = pricePerUnit * amount;

        if (paymentToken == address(0)) {
            // ETH payment
            require(msg.value >= totalPrice, "Insufficient payment");
            _processPurchase(licenseId, amount, address(0));
            
            // Handle refund if overpaid
            if (msg.value > totalPrice) {
                unchecked {
                    uint256 refund = msg.value - totalPrice;
                    (bool rc, ) = msg.sender.call{value: refund}("");
                    require(rc, "Refund failed");
                }
            }
        } else {
            // ERC20 token payment
            require(paymentTokenManager.isTokenSupported(paymentToken), "Token not supported");
            require(msg.value == 0, "ETH not needed for token payment");
            
            IERC20 token = IERC20(paymentToken);
            require(token.balanceOf(msg.sender) >= totalPrice, "Insufficient token balance");
            require(token.allowance(msg.sender, address(this)) >= totalPrice, "Insufficient token allowance");
            
            // Transfer tokens from buyer to marketplace
            token.safeTransferFrom(msg.sender, address(this), totalPrice);
            
            _processPurchase(licenseId, amount, paymentToken);
        }
    }

    /**
     * @notice Process a single license purchase
     * @dev Helper function to reduce stack depth
     */
    function _processPurchase(uint256 licenseId, uint256 amount, address paymentToken) internal {
        uint256 pricePerUnit = licenseContract.licensePrice(licenseId);
        uint256 totalPrice = pricePerUnit * amount;
        uint256 royaltyBP = licenseContract.licenseRoyalty(licenseId);
        
        bytes32 workHash = licenseContract.getWorkHash(licenseId);
        uint256 tokenId = artworkContract.getTokenIdByHash(workHash);
        (, address creator,,,,) = artworkContract.getWork(tokenId);

        uint256 royaltyAmount = (totalPrice * royaltyBP) / 10000;
        uint256 platformAmount = (totalPrice * PLATFORM_BP) / 10000;
        uint256 nationalAmount = (totalPrice * NATIONAL_BP) / 10000;
        uint256 sellerAmount = totalPrice - royaltyAmount - platformAmount - nationalAmount;

        if (paymentToken == address(0)) {
            // ETH payment
            creatorBalances[creator] += (sellerAmount + royaltyAmount);
            platformBalance += platformAmount;
            nationalBalance += nationalAmount;
        } else {
            // ERC20 token payment
            creatorTokenBalances[creator][paymentToken] += (sellerAmount + royaltyAmount);
            platformTokenBalances[paymentToken] += platformAmount;
            nationalTokenBalances[paymentToken] += nationalAmount;
        }
        
        totalSales[licenseId] += amount;
        creatorRevenue[creator] += (sellerAmount + royaltyAmount);
        totalVolume += totalPrice;

        licenseContract.safeTransferFrom(address(this), msg.sender, licenseId, amount, "");
        emit LicensePurchased(licenseId, msg.sender, totalPrice, amount, paymentToken);
    }

    /**
     * @notice Batch purchase multiple license types
     * @dev Gas savings from batched transfers
     */
    function batchBuyLicense(
        uint256[] calldata licenseIds,
        uint256[] calldata amounts
    ) external payable nonReentrant whenNotPaused {
        require(licenseIds.length == amounts.length, "Array length mismatch");
        require(licenseIds.length > 0 && licenseIds.length <= 10, "Invalid batch size");

        uint256 totalCost = 0;

        // Calculate total cost
        for (uint256 i = 0; i < licenseIds.length; ) {
            uint256 licenseId = licenseIds[i];
            uint256 amount = amounts[i];
            require(amount > 0, "Amount zero");

            uint256 pricePerUnit = licenseContract.licensePrice(licenseId);
            require(pricePerUnit > 0, "License not for sale");

            uint256 marketBalance = licenseContract.balanceOf(address(this), licenseId);
            require(marketBalance >= amount, "Insufficient supply");

            unchecked {
                totalCost += pricePerUnit * amount;
                i++;
            }
        }

        require(msg.value >= totalCost, "Insufficient payment");

        // Process each purchase
        for (uint256 i = 0; i < licenseIds.length; ) {
            _processPurchase(licenseIds[i], amounts[i], address(0));
            unchecked { i++; }
        }

        // Emit batch purchase event
        emit BatchPurchaseCompleted(msg.sender, licenseIds, amounts, totalCost, address(0));

        // Refund excess
        if (msg.value > totalCost) {
            unchecked {
                (bool rc, ) = msg.sender.call{value: msg.value - totalCost}("");
                require(rc, "Refund failed");
            }
        }
    }

    /**
     * @notice Batch purchase multiple license types with multi-token support
     * @dev Gas savings from batched transfers
     */
    function batchBuyLicenseWithToken(
        uint256[] calldata licenseIds,
        uint256[] calldata amounts,
        address paymentToken
    ) external payable nonReentrant whenNotPaused {
        require(licenseIds.length == amounts.length, "Array length mismatch");
        require(licenseIds.length > 0 && licenseIds.length <= 10, "Invalid batch size");

        uint256 totalCost = 0;
        for (uint256 i = 0; i < licenseIds.length; ) {
            uint256 licenseId = licenseIds[i];
            uint256 amount = amounts[i];
            require(amount > 0, "Amount zero");

            uint256 pricePerUnit = licenseContract.licensePrice(licenseId);
            require(pricePerUnit > 0, "License not for sale");

            uint256 marketBalance = licenseContract.balanceOf(address(this), licenseId);
            require(marketBalance >= amount, "Insufficient supply");

            unchecked {
                totalCost += pricePerUnit * amount;
                i++;
            }
        }

        if (paymentToken == address(0)) {
            // ETH payment
            require(msg.value >= totalCost, "Insufficient payment");
            
            // Process each purchase
            for (uint256 i = 0; i < licenseIds.length; ) {
                _processPurchase(licenseIds[i], amounts[i], address(0));
                unchecked { i++; }
            }
            
            // Refund excess
            if (msg.value > totalCost) {
                unchecked {
                    (bool rc, ) = msg.sender.call{value: msg.value - totalCost}("");
                    require(rc, "Refund failed");
                }
            }
        } else {
            // ERC20 token payment
            require(paymentTokenManager.isTokenSupported(paymentToken), "Token not supported");
            require(msg.value == 0, "ETH not needed for token payment");
            
            IERC20 token = IERC20(paymentToken);
            require(token.balanceOf(msg.sender) >= totalCost, "Insufficient token balance");
            require(token.allowance(msg.sender, address(this)) >= totalCost, "Insufficient token allowance");
            
            // Transfer tokens from buyer to marketplace
            token.safeTransferFrom(msg.sender, address(this), totalCost);
            
            // Process each purchase
            for (uint256 i = 0; i < licenseIds.length; ) {
                _processPurchase(licenseIds[i], amounts[i], paymentToken);
                unchecked { i++; }
            }
        }

        // Emit batch purchase event
        emit BatchPurchaseCompleted(msg.sender, licenseIds, amounts, totalCost, paymentToken);
    }

    // Creator withdraw earnings
    function withdrawEarnings() external nonReentrant {
        uint256 bal = creatorBalances[msg.sender];
        require(bal > 0, "No earnings");
        creatorBalances[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: bal}("");
        require(ok, "Transfer failed");
        emit EarningsWithdrawn(msg.sender, bal, address(0));
    }

    /**
     * @notice Withdraw earnings in specific token
     * @param token Address of the token to withdraw (address(0) for ETH)
     */
    function withdrawEarnings(address token) external nonReentrant {
        if (token == address(0)) {
            // ETH withdrawal
            uint256 bal = creatorBalances[msg.sender];
            require(bal > 0, "No earnings");
            creatorBalances[msg.sender] = 0;
            (bool ok, ) = msg.sender.call{value: bal}("");
            require(ok, "Transfer failed");
            emit EarningsWithdrawn(msg.sender, bal, address(0));
        } else {
            // ERC20 token withdrawal
            require(paymentTokenManager.isTokenSupported(token), "Token not supported");
            uint256 bal = creatorTokenBalances[msg.sender][token];
            require(bal > 0, "No earnings");
            creatorTokenBalances[msg.sender][token] = 0;
            
            IERC20(token).safeTransfer(msg.sender, bal);
            emit EarningsWithdrawn(msg.sender, bal, token);
        }
    }

    // Platform withdraw
    function withdrawPlatform() external nonReentrant {
        require(msg.sender == platformWallet || msg.sender == owner(), "Not authorized");
        uint256 bal = platformBalance;
        require(bal > 0, "No platform balance");
        platformBalance = 0;
        (bool ok, ) = platformWallet.call{value: bal}("");
        require(ok, "Platform transfer failed");
        emit PlatformWithdrawn(platformWallet, bal, address(0));
    }

    /**
     * @notice Withdraw platform earnings in specific token
     * @param token Address of the token to withdraw (address(0) for ETH)
     */
    function withdrawPlatform(address token) external nonReentrant {
        require(msg.sender == platformWallet || msg.sender == owner(), "Not authorized");
        
        if (token == address(0)) {
            // ETH withdrawal
            uint256 bal = platformBalance;
            require(bal > 0, "No platform balance");
            platformBalance = 0;
            (bool ok, ) = platformWallet.call{value: bal}("");
            require(ok, "Platform transfer failed");
            emit PlatformWithdrawn(platformWallet, bal, address(0));
        } else {
            // ERC20 token withdrawal
            require(paymentTokenManager.isTokenSupported(token), "Token not supported");
            uint256 bal = platformTokenBalances[token];
            require(bal > 0, "No platform balance");
            platformTokenBalances[token] = 0;
            
            IERC20(token).safeTransfer(platformWallet, bal);
            emit PlatformWithdrawn(platformWallet, bal, token);
        }
    }

    // National fund withdraw
    function withdrawNational() external nonReentrant {
        require(msg.sender == nationalFund || msg.sender == owner(), "Not authorized");
        uint256 bal = nationalBalance;
        require(bal > 0, "No national balance");
        nationalBalance = 0;
        (bool ok, ) = nationalFund.call{value: bal}("");
        require(ok, "National transfer failed");
        emit NationalWithdrawn(nationalFund, bal, address(0));
    }

    /**
     * @notice Withdraw national fund earnings in specific token
     * @param token Address of the token to withdraw (address(0) for ETH)
     */
    function withdrawNational(address token) external nonReentrant {
        require(msg.sender == nationalFund || msg.sender == owner(), "Not authorized");
        
        if (token == address(0)) {
            // ETH withdrawal
            uint256 bal = nationalBalance;
            require(bal > 0, "No national balance");
            nationalBalance = 0;
            (bool ok, ) = nationalFund.call{value: bal}("");
            require(ok, "National transfer failed");
            emit NationalWithdrawn(nationalFund, bal, address(0));
        } else {
            // ERC20 token withdrawal
            require(paymentTokenManager.isTokenSupported(token), "Token not supported");
            uint256 bal = nationalTokenBalances[token];
            require(bal > 0, "No national balance");
            nationalTokenBalances[token] = 0;
            
            IERC20(token).safeTransfer(nationalFund, bal);
            emit NationalWithdrawn(nationalFund, bal, token);
        }
    }

    // Owner can set platform and national addresses
    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid");
        platformWallet = _platformWallet;
    }

    function setNationalFund(address _nationalFund) external onlyOwner {
        require(_nationalFund != address(0), "Invalid");
        nationalFund = _nationalFund;
    }

    // Pause/unpause marketplace
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Update platform wallet
     */
    function updatePlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid address");
        platformWallet = _platformWallet;
    }

    /**
     * @notice Update national fund
     */
    function updateNationalFund(address _nationalFund) external onlyOwner {
        require(_nationalFund != address(0), "Invalid address");
        nationalFund = _nationalFund;
    }

    /**
     * @notice Update license price
     */
    function updateLicensePrice(uint256 _licenseId, uint256 _newPrice) external {
        require(listings[_licenseId].seller == msg.sender, "Not license owner");
        require(_newPrice > 0, "Price must be greater than 0");
        listings[_licenseId].price = _newPrice;
        emit PriceUpdated(_licenseId, _newPrice);
    }

    /**
     * @notice Get marketplace statistics
     */
    function getMarketplaceStats() external view returns (
        uint256 _totalVolume,
        uint256 _platformBalance,
        uint256 _nationalBalance
    ) {
        return (totalVolume, platformBalance, nationalBalance);
    }

    /**
     * @notice Get license sales data
     */
    function getLicenseSales(uint256 licenseId) external view returns (uint256) {
        return totalSales[licenseId];
    }

    /**
     * @notice Get creator lifetime revenue
     */
    function getCreatorRevenue(address creator) external view returns (uint256) {
        return creatorRevenue[creator];
    }

    /**
     * @notice Get marketplace balance for specific license
     */
    function getMarketplaceBalance(uint256 licenseId) external view returns (uint256) {
        return licenseContract.balanceOf(address(this), licenseId);
    }

    /**
     * @notice Get creator balance
     */
    function creatorBalance(address creator) external view returns (uint256) {
        return creatorBalances[creator];
    }


    // Allow contract to receive ETH (for sales)
    receive() external payable {}
    fallback() external payable {}

    /**
     * @notice Handle the receipt of a single ERC1155 token type
     */
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    /**
     * @notice Handle the receipt of multiple ERC1155 token types
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @notice Indicates whether the contract implements the interface defined by `interfaceId`
     */
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
