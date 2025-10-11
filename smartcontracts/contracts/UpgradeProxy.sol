// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UpgradeProxy
 * @dev Transparent upgradeable proxy pattern for contract upgrades
 * Allows upgrading contract logic while preserving state and address
 */
contract UpgradeProxy {
    // Storage slot with the address of the current implementation
    bytes32 private constant IMPLEMENTATION_SLOT = keccak256("eip1967.proxy.implementation");
    
    // Storage slot with the admin of the proxy
    bytes32 private constant ADMIN_SLOT = keccak256("eip1967.proxy.admin");

    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);

    /**
     * @dev Constructor sets initial implementation and admin
     * @param _implementation Address of initial implementation contract
     * @param _admin Address of proxy admin
     */
    constructor(address _implementation, address _admin) {
        require(_implementation != address(0), "Invalid implementation");
        require(_admin != address(0), "Invalid admin");
        
        _setImplementation(_implementation);
        _setAdmin(_admin);
    }

    /**
     * @dev Modifier to check if caller is admin
     */
    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            _fallback();
        }
    }

    /**
     * @dev Returns current implementation address
     */
    function implementation() external ifAdmin returns (address) {
        return _getImplementation();
    }

    /**
     * @dev Returns current admin address
     */
    function admin() external ifAdmin returns (address) {
        return _getAdmin();
    }

    /**
     * @dev Upgrade to new implementation
     * @param newImplementation Address of new implementation contract
     */
    function upgradeTo(address newImplementation) external ifAdmin {
        require(newImplementation != address(0), "Invalid implementation");
        require(newImplementation != _getImplementation(), "Same implementation");
        
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    /**
     * @dev Change proxy admin
     * @param newAdmin Address of new admin
     */
    function changeAdmin(address newAdmin) external ifAdmin {
        require(newAdmin != address(0), "Invalid admin");
        address previousAdmin = _getAdmin();
        _setAdmin(newAdmin);
        emit AdminChanged(previousAdmin, newAdmin);
    }

    /**
     * @dev Fallback function delegates calls to implementation
     */
    fallback() external payable {
        _fallback();
    }

    /**
     * @dev Receive function for ETH transfers
     */
    receive() external payable {
        _fallback();
    }

    /**
     * @dev Internal fallback implementation
     */
    function _fallback() internal {
        address impl = _getImplementation();
        require(impl != address(0), "No implementation");

        assembly {
            // Copy msg.data
            calldatacopy(0, 0, calldatasize())

            // Delegate call to implementation
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)

            // Copy return data
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                // Revert if delegatecall failed
                revert(0, returndatasize())
            }
            default {
                // Return if delegatecall succeeded
                return(0, returndatasize())
            }
        }
    }

    /**
     * @dev Get implementation address from storage slot
     */
    function _getImplementation() internal view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    /**
     * @dev Set implementation address in storage slot
     * @param newImplementation Address to set
     */
    function _setImplementation(address newImplementation) internal {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, newImplementation)
        }
    }

    /**
     * @dev Get admin address from storage slot
     */
    function _getAdmin() internal view returns (address adm) {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            adm := sload(slot)
        }
    }

    /**
     * @dev Set admin address in storage slot
     * @param newAdmin Address to set
     */
    function _setAdmin(address newAdmin) internal {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            sstore(slot, newAdmin)
        }
    }
}

/**
 * @title ProxyAdmin
 * @dev Admin contract for managing multiple proxies
 * Provides centralized upgrade management
 */
contract ProxyAdmin {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ProxyAdmin: not owner");
        _;
    }

    /**
     * @dev Upgrade proxy to new implementation
     * @param proxy Proxy contract address
     * @param implementation New implementation address
     */
    function upgrade(UpgradeProxy proxy, address implementation) public onlyOwner {
        proxy.upgradeTo(implementation);
    }

    /**
     * @dev Change proxy admin
     * @param proxy Proxy contract address
     * @param newAdmin New admin address
     */
    function changeProxyAdmin(UpgradeProxy proxy, address newAdmin) public onlyOwner {
        proxy.changeAdmin(newAdmin);
    }

    /**
     * @dev Transfer ownership of ProxyAdmin
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}