// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Params.sol";

/**
 * @title WalletBlocklist
 * @dev Contract for managing blocklisted/paused wallets to prevent bad actors from transferring native coins
 * @notice This contract allows administrators to blocklist wallets that are identified as bad actors
 */
contract WalletBlocklist is Params {
    
    // Mapping to track blocklisted addresses
    mapping(address => bool) private blocklist;
    
    // Mapping to track when an address was blocklisted
    mapping(address => uint256) private blocklistTimestamp;
    
    // Mapping to track the reason for blocklisting
    mapping(address => string) private blocklistReason;
    
    // Array to keep track of all blocklisted addresses
    address[] private blocklistedAddresses;
    
    // Mapping to track index in blocklistedAddresses array
    mapping(address => uint256) private blocklistIndex;
    
    // Events
    event WalletBlocklisted(address indexed wallet, string reason, uint256 timestamp);
    event WalletUnblocklisted(address indexed wallet, uint256 timestamp);
    event BlocklistCleared(uint256 timestamp);
    
    /**
     * @dev Constructor - automatically sets the hardcoded admin address
     */
    constructor() {
        // Hardcoded admin address
        admin = 0x2514737a2ADa46f4FD14C4E532D1e0D93E2873Ad;
        admins[0x2514737a2ADa46f4FD14C4E532D1e0D93E2873Ad] = true;
        initialized = true;
    }
    
    /**
     * @dev Add a wallet to the blocklist
     * @param wallet The address to blocklist
     * @param reason The reason for blocklisting
     */
    function addToBlocklist(address wallet, string calldata reason) 
        external 
        onlyAdmin 
        onlyInitialized 
    {
        require(wallet != address(0), "Cannot blocklist zero address");
        require(!blocklist[wallet], "Wallet already blocklisted");
        
        blocklist[wallet] = true;
        blocklistTimestamp[wallet] = block.timestamp;
        blocklistReason[wallet] = reason;
        
        // Add to array
        blocklistIndex[wallet] = blocklistedAddresses.length;
        blocklistedAddresses.push(wallet);
        
        emit WalletBlocklisted(wallet, reason, block.timestamp);
    }
    
    /**
     * @dev Add multiple wallets to the blocklist in batch
     * @param wallets Array of addresses to blocklist
     * @param reasons Array of reasons for blocklisting (must match wallets length)
     */
    function addToBlocklistBatch(address[] calldata wallets, string[] calldata reasons) 
        external 
        onlyAdmin 
        onlyInitialized 
    {
        require(wallets.length == reasons.length, "Arrays length mismatch");
        require(wallets.length > 0, "Empty arrays");
        require(wallets.length <= 100, "Batch too large"); // Prevent gas limit issues
        
        for (uint256 i = 0; i < wallets.length; i++) {
            address wallet = wallets[i];
            
            if (wallet == address(0) || blocklist[wallet]) {
                continue; // Skip invalid or already blocklisted addresses
            }
            
            blocklist[wallet] = true;
            blocklistTimestamp[wallet] = block.timestamp;
            blocklistReason[wallet] = reasons[i];
            
            // Add to array
            blocklistIndex[wallet] = blocklistedAddresses.length;
            blocklistedAddresses.push(wallet);
            
            emit WalletBlocklisted(wallet, reasons[i], block.timestamp);
        }
    }
    
    /**
     * @dev Remove a wallet from the blocklist
     * @param wallet The address to remove from blocklist
     */
    function removeFromBlocklist(address wallet) 
        external 
        onlyAdmin 
        onlyInitialized 
    {
        require(blocklist[wallet], "Wallet not blocklisted");
        
        blocklist[wallet] = false;
        
        // Remove from array
        uint256 index = blocklistIndex[wallet];
        uint256 lastIndex = blocklistedAddresses.length - 1;
        
        if (index != lastIndex) {
            address lastWallet = blocklistedAddresses[lastIndex];
            blocklistedAddresses[index] = lastWallet;
            blocklistIndex[lastWallet] = index;
        }
        
        blocklistedAddresses.pop();
        delete blocklistIndex[wallet];
        delete blocklistTimestamp[wallet];
        delete blocklistReason[wallet];
        
        emit WalletUnblocklisted(wallet, block.timestamp);
    }
    
    /**
     * @dev Remove multiple wallets from the blocklist in batch
     * @param wallets Array of addresses to remove from blocklist
     */
    function removeFromBlocklistBatch(address[] calldata wallets) 
        external 
        onlyAdmin 
        onlyInitialized 
    {
        require(wallets.length > 0, "Empty array");
        require(wallets.length <= 100, "Batch too large"); // Prevent gas limit issues
        
        for (uint256 i = 0; i < wallets.length; i++) {
            address wallet = wallets[i];
            
            if (!blocklist[wallet]) {
                continue; // Skip if not blocklisted
            }
            
            blocklist[wallet] = false;
            
            // Remove from array
            uint256 index = blocklistIndex[wallet];
            uint256 lastIndex = blocklistedAddresses.length - 1;
            
            if (index != lastIndex) {
                address lastWallet = blocklistedAddresses[lastIndex];
                blocklistedAddresses[index] = lastWallet;
                blocklistIndex[lastWallet] = index;
            }
            
            blocklistedAddresses.pop();
            delete blocklistIndex[wallet];
            delete blocklistTimestamp[wallet];
            delete blocklistReason[wallet];
            
            emit WalletUnblocklisted(wallet, block.timestamp);
        }
    }
    
    /**
     * @dev Check if a wallet is blocklisted
     * @param wallet The address to check
     * @return bool True if the wallet is blocklisted
     */
    function isBlocklisted(address wallet) external view returns (bool) {
        return blocklist[wallet];
    }
    
    /**
     * @dev Get blocklist information for a wallet
     * @param wallet The address to query
     * @return isBlocked True if the wallet is blocklisted
     * @return timestamp When the wallet was blocklisted
     * @return reason The reason for blocklisting
     */
    function getBlocklistInfo(address wallet) 
        external 
        view 
        returns (bool isBlocked, uint256 timestamp, string memory reason) 
    {
        return (
            blocklist[wallet],
            blocklistTimestamp[wallet],
            blocklistReason[wallet]
        );
    }
    
    /**
     * @dev Get all blocklisted addresses
     * @return Array of all blocklisted addresses
     */
    function getAllBlocklisted() external view returns (address[] memory) {
        return blocklistedAddresses;
    }
    
    /**
     * @dev Get the total number of blocklisted addresses
     * @return The count of blocklisted addresses
     */
    function getBlocklistCount() external view returns (uint256) {
        return blocklistedAddresses.length;
    }
    
    /**
     * @dev Get blocklisted addresses with pagination
     * @param offset Starting index
     * @param limit Number of addresses to return
     * @return Array of blocklisted addresses
     */
    function getBlocklistedPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory) 
    {
        require(offset < blocklistedAddresses.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > blocklistedAddresses.length) {
            end = blocklistedAddresses.length;
        }
        
        uint256 resultLength = end - offset;
        address[] memory result = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = blocklistedAddresses[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Clear the entire blocklist (emergency function)
     * @notice This should only be used in extreme circumstances
     */
    function clearBlocklist() external onlyAdmin onlyInitialized {
        uint256 length = blocklistedAddresses.length;
        
        for (uint256 i = 0; i < length; i++) {
            address wallet = blocklistedAddresses[i];
            delete blocklist[wallet];
            delete blocklistTimestamp[wallet];
            delete blocklistReason[wallet];
            delete blocklistIndex[wallet];
        }
        
        delete blocklistedAddresses;
        
        emit BlocklistCleared(block.timestamp);
    }
}
