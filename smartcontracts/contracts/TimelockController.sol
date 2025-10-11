// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TimelockController
 * @dev Timelock for admin functions - delays critical operations
 * Provides time for community review before execution
 */
contract TimelockController {
    uint256 public constant MINIMUM_DELAY = 2 days;
    uint256 public constant MAXIMUM_DELAY = 30 days;
    uint256 public delay;

    mapping(bytes32 => bool) public queuedTransactions;
    mapping(bytes32 => uint256) public transactionTimestamps;

    address public admin;
    address public pendingAdmin;

    event NewDelay(uint256 indexed newDelay);
    event QueueTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event CancelTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data);
    event ExecuteTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Timelock: caller is not admin");
        _;
    }

    constructor(address admin_, uint256 delay_) {
        require(delay_ >= MINIMUM_DELAY && delay_ <= MAXIMUM_DELAY, "Timelock: invalid delay");
        
        admin = admin_;
        delay = delay_;
    }

    /**
     * @dev Queue a transaction for execution after timelock
     * @param target Target contract address
     * @param value ETH value to send
     * @param signature Function signature (e.g., "setPlatformWallet(address)")
     * @param data Encoded function arguments
     * @param eta Estimated time of execution (must be delay seconds from now)
     */
    function queueTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) public onlyAdmin returns (bytes32) {
        require(eta >= block.timestamp + delay, "Timelock: ETA must satisfy delay");

        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = true;
        transactionTimestamps[txHash] = eta;

        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }

    /**
     * @dev Cancel a queued transaction
     * @param target Target contract address
     * @param value ETH value
     * @param signature Function signature
     * @param data Encoded arguments
     * @param eta Execution time
     */
    function cancelTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) public onlyAdmin {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = false;

        emit CancelTransaction(txHash, target, value, signature, data);
    }

    /**
     * @dev Execute a queued transaction after timelock expires
     * @param target Target contract address
     * @param value ETH value to send
     * @param signature Function signature
     * @param data Encoded function arguments
     * @param eta Execution time
     */
    function executeTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) public payable onlyAdmin returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));

        require(queuedTransactions[txHash], "Timelock: transaction not queued");
        require(block.timestamp >= eta, "Timelock: transaction not yet ready");
        require(block.timestamp <= eta + 3 days, "Timelock: transaction expired");

        queuedTransactions[txHash] = false;

        bytes memory callData;
        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        (bool success, bytes memory returnData) = target.call{value: value}(callData);
        require(success, "Timelock: transaction execution reverted");

        emit ExecuteTransaction(txHash, target, value, signature, data);

        return returnData;
    }

    /**
     * @dev Set new delay for future transactions
     * @param delay_ New delay in seconds
     */
    function setDelay(uint256 delay_) public {
        require(msg.sender == address(this), "Timelock: only timelock can set delay");
        require(delay_ >= MINIMUM_DELAY && delay_ <= MAXIMUM_DELAY, "Timelock: invalid delay");
        
        delay = delay_;
        emit NewDelay(delay_);
    }

    /**
     * @dev Accept admin role (two-step transfer)
     */
    function acceptAdmin() public {
        require(msg.sender == pendingAdmin, "Timelock: only pending admin");
        admin = msg.sender;
        pendingAdmin = address(0);
    }

    /**
     * @dev Set pending admin (must be accepted)
     * @param pendingAdmin_ New pending admin address
     */
    function setPendingAdmin(address pendingAdmin_) public {
        require(msg.sender == address(this), "Timelock: only timelock");
        pendingAdmin = pendingAdmin_;
    }

    receive() external payable {}
}