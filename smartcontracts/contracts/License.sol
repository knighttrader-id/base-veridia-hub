// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IArtwork {
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
 * License.sol - Enhanced ERC1155 License Token System
 * - Full ERC-1155 compliance with OpenZeppelin
 * - Creator-controlled license minting
 * - License expiration and renewal mechanisms
 * - Burn functionality for license management
 * - Batch operations for gas efficiency
 * - Emergency pause functionality
 * - Royalty and pricing metadata per license type
 */
contract License is ERC1155, Ownable, ReentrancyGuard, Pausable {
    IArtwork public artworkContract;

    uint256 public nextLicenseId = 1;

    // License metadata
    mapping(uint256 => bytes32) public licenseToWorkHash;
    mapping(uint256 => uint256) public licensePrice;
    mapping(uint256 => uint256) public licenseRoyalty;
    mapping(uint256 => uint256) public licenseExpiration; // 0 = perpetual
    mapping(uint256 => bool) public licenseBurnable;
    mapping(uint256 => string) public licenseTermsURI; // IPFS URI for T&C

    event LicenseMinted(uint256 indexed licenseId, bytes32 indexed workHash, uint256 amount, uint256 price, uint256 royalty, uint256 expiration);
    event LicenseBurned(uint256 indexed licenseId, address indexed burner, uint256 amount);
    event LicenseRenewed(uint256 indexed licenseId, uint256 newExpiration);
    event LicenseTermsUpdated(uint256 indexed licenseId, string termsURI);

    constructor(address _artworkContract, string memory _uri) ERC1155(_uri) Ownable(msg.sender) {
        require(_artworkContract != address(0), "Invalid artwork contract");
        artworkContract = IArtwork(_artworkContract);
    }

    /**
     * @notice Mint new license tokens with optional expiration
     * @param _workHash Content hash of the artwork
     * @param _amount Number of license tokens to mint
     * @param _price Price per license in wei
     * @param _royalty Royalty percentage in basis points (max 5000 = 50%)
     * @param _expiration Expiration timestamp (0 = perpetual)
     * @param _termsURI IPFS URI for license terms and conditions
     */
    function mintLicense(
        bytes32 _workHash,
        uint256 _amount,
        uint256 _price,
        uint256 _royalty,
        uint256 _expiration,
        string calldata _termsURI
    ) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount zero");
        require(_royalty <= 5000, "Royalty too high");
        require(_expiration == 0 || _expiration > block.timestamp, "Invalid expiration");

        uint256 tokenId = artworkContract.getTokenIdByHash(_workHash);
        (, address creator,,,,) = artworkContract.getWork(tokenId);
        require(creator != address(0), "Work not exists");
        require(msg.sender == creator, "Only creator can mint license");

        uint256 licenseId;
        unchecked {
            licenseId = nextLicenseId;
            nextLicenseId += 1;
        }

        licenseToWorkHash[licenseId] = _workHash;
        licensePrice[licenseId] = _price;
        licenseRoyalty[licenseId] = _royalty;
        licenseExpiration[licenseId] = _expiration;
        licenseBurnable[licenseId] = true; // Burnable by default
        licenseTermsURI[licenseId] = _termsURI;

        _mint(msg.sender, licenseId, _amount, "");

        emit LicenseMinted(licenseId, _workHash, _amount, _price, _royalty, _expiration);
    }

    // Allow owner to set base URI dynamically
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    /**
     * @notice Returns the URI for a given token ID
     * @dev Overrides ERC1155 uri function to append token ID
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(super.uri(tokenId), Strings.toString(tokenId)));
    }

    /**
     * @notice Hook called during token transfers
     * @dev Prevents transfer of expired licenses
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        // Check for expired licenses (only on transfers, not mints)
        if (from != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 licenseId = ids[i];
                uint256 expiration = licenseExpiration[licenseId];
                
                // Check if license is expired (expiration > 0 and current time > expiration)
                if (expiration > 0 && block.timestamp > expiration) {
                    revert("License expired");
                }
            }
        }
        
        super._update(from, to, ids, values);
    }

    /**
     * @notice Batch mint multiple license types
     * @dev Saves gas compared to individual mints
     */
    function batchMintLicense(
        bytes32[] calldata _workHashes,
        uint256[] calldata _amounts,
        uint256[] calldata _prices,
        uint256[] calldata _royalties,
        uint256[] calldata _expirations,
        string[] calldata _termsURIs
    ) external nonReentrant whenNotPaused returns (uint256[] memory) {
        uint256 length = _workHashes.length;
        require(length > 0 && length <= 20, "Invalid batch size");
        require(
            length == _amounts.length &&
            length == _prices.length &&
            length == _royalties.length &&
            length == _expirations.length &&
            length == _termsURIs.length,
            "Array length mismatch"
        );

        uint256[] memory licenseIds = new uint256[](length);

        for (uint256 i = 0; i < length; ) {
            _mintSingleLicense(
                _workHashes[i],
                _amounts[i],
                _prices[i],
                _royalties[i],
                _expirations[i],
                _termsURIs[i],
                i
            );
            licenseIds[i] = nextLicenseId - 1;
            unchecked { i++; }
        }

        return licenseIds;
    }

    function _mintSingleLicense(
        bytes32 _workHash,
        uint256 _amount,
        uint256 _price,
        uint256 _royalty,
        uint256 _expiration,
        string calldata _termsURI,
        uint256 _index
    ) internal {
        require(_amount > 0, "Amount zero");
        require(_royalty <= 5000, "Royalty too high");
        require(_expiration == 0 || _expiration > block.timestamp, "Invalid expiration");

        uint256 tokenId = artworkContract.getTokenIdByHash(_workHash);
        (, address creator,,,,) = artworkContract.getWork(tokenId);
        require(creator != address(0), "Work not exists");
        require(msg.sender == creator, "Only creator can mint license");

        uint256 licenseId;
        unchecked {
            licenseId = nextLicenseId;
            nextLicenseId += 1;
        }

        licenseToWorkHash[licenseId] = _workHash;
        licensePrice[licenseId] = _price;
        licenseRoyalty[licenseId] = _royalty;
        licenseExpiration[licenseId] = _expiration;
        licenseBurnable[licenseId] = true;
        licenseTermsURI[licenseId] = _termsURI;

        _mint(msg.sender, licenseId, _amount, "");

        emit LicenseMinted(licenseId, _workHash, _amount, _price, _royalty, _expiration);
    }

    /**
     * @notice Burn license tokens
     * @dev Only token holder can burn their own licenses
     */
    function burnLicense(uint256 licenseId, uint256 amount) external nonReentrant {
        require(licenseBurnable[licenseId], "License not burnable");
        require(balanceOf(msg.sender, licenseId) >= amount, "Insufficient balance");

        _burn(msg.sender, licenseId, amount);

        emit LicenseBurned(licenseId, msg.sender, amount);
    }

    /**
     * @notice Batch burn multiple license types
     */
    function batchBurnLicense(
        uint256[] calldata licenseIds,
        uint256[] calldata amounts
    ) external nonReentrant {
        require(licenseIds.length == amounts.length, "Array length mismatch");
        require(licenseIds.length > 0 && licenseIds.length <= 20, "Invalid batch size");

        for (uint256 i = 0; i < licenseIds.length; ) {
            require(licenseBurnable[licenseIds[i]], "License not burnable");
            require(balanceOf(msg.sender, licenseIds[i]) >= amounts[i], "Insufficient balance");

            _burn(msg.sender, licenseIds[i], amounts[i]);
            emit LicenseBurned(licenseIds[i], msg.sender, amounts[i]);

            unchecked { i++; }
        }
    }

    /**
     * @notice Renew expired license (extend expiration)
     * @dev Only creator can renew
     */
    function renewLicense(uint256 licenseId, uint256 newExpiration) external {
        require(newExpiration > block.timestamp, "Invalid expiration");
        
        bytes32 workHash = licenseToWorkHash[licenseId];
        require(workHash != bytes32(0), "License does not exist");
        
        uint256 tokenId = artworkContract.getTokenIdByHash(workHash);
        (, address creator,,,,) = artworkContract.getWork(tokenId);
        require(msg.sender == creator, "Only creator can renew");

        licenseExpiration[licenseId] = newExpiration;

        emit LicenseRenewed(licenseId, newExpiration);
    }

    /**
     * @notice Check if license is currently valid
     */
    function isLicenseValid(uint256 licenseId) external view returns (bool) {
        bytes32 workHash = licenseToWorkHash[licenseId];
        if (workHash == bytes32(0)) return false;
        
        uint256 expiration = licenseExpiration[licenseId];
        return expiration == 0 || block.timestamp < expiration;
    }

    /**
     * @notice Update license terms URI
     * @dev Only creator can update
     */
    function updateLicenseTerms(uint256 licenseId, string calldata termsURI) external {
        bytes32 workHash = licenseToWorkHash[licenseId];
        require(workHash != bytes32(0), "License does not exist");
        
        uint256 tokenId = artworkContract.getTokenIdByHash(workHash);
        (, address creator,,,,) = artworkContract.getWork(tokenId);
        require(msg.sender == creator, "Only creator can update terms");

        licenseTermsURI[licenseId] = termsURI;

        emit LicenseTermsUpdated(licenseId, termsURI);
    }

    /**
     * @notice Get complete license metadata
     */
    function getLicenseMetadata(uint256 licenseId) external view returns (
        bytes32 workHash,
        uint256 price,
        uint256 royalty,
        uint256 expiration,
        bool burnable,
        string memory termsURI
    ) {
        require(licenseToWorkHash[licenseId] != bytes32(0), "License does not exist");
        return (
            licenseToWorkHash[licenseId],
            licensePrice[licenseId],
            licenseRoyalty[licenseId],
            licenseExpiration[licenseId],
            licenseBurnable[licenseId],
            licenseTermsURI[licenseId]
        );
    }

    // Helper
    function getWorkHash(uint256 licenseId) external view returns (bytes32) {
        bytes32 h = licenseToWorkHash[licenseId];
        require(h != bytes32(0), "License does not exist");
        return h;
    }

    /**
     * @notice Emergency pause - stops all minting and transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}