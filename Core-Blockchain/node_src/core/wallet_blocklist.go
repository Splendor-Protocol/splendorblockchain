// Copyright 2024 The Splendor Blockchain Authors
// This file is part of the Splendor Blockchain library.
//
// The Splendor Blockchain library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package core

import (
	"math/big"
	"sync"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/vm"
	"github.com/ethereum/go-ethereum/log"
	"github.com/ethereum/go-ethereum/params"
)

// WalletBlocklistContractAddress is the address of the WalletBlocklist system contract
// This should match the address deployed in your genesis.json
var WalletBlocklistContractAddress = common.HexToAddress("0x0000000000000000000000000000000000001007")

// BlocklistChecker provides methods to check if addresses are blocklisted
type BlocklistChecker struct {
	enabled bool
	mu      sync.RWMutex
}

var (
	blocklistChecker     *BlocklistChecker
	blocklistCheckerOnce sync.Once
)

// GetBlocklistChecker returns the singleton blocklist checker instance
func GetBlocklistChecker() *BlocklistChecker {
	blocklistCheckerOnce.Do(func() {
		blocklistChecker = &BlocklistChecker{
			enabled: true, // Enable by default
		}
	})
	return blocklistChecker
}

// SetEnabled enables or disables the blocklist checking
func (bc *BlocklistChecker) SetEnabled(enabled bool) {
	bc.mu.Lock()
	defer bc.mu.Unlock()
	bc.enabled = enabled
	log.Info("Blocklist checker status changed", "enabled", enabled)
}

// IsEnabled returns whether blocklist checking is enabled
func (bc *BlocklistChecker) IsEnabled() bool {
	bc.mu.RLock()
	defer bc.mu.RUnlock()
	return bc.enabled
}

// IsBlocklisted checks if an address is blocklisted by calling the smart contract
func (bc *BlocklistChecker) IsBlocklisted(statedb vm.StateDB, address common.Address, config *params.ChainConfig, blockNumber *big.Int) bool {
	// If blocklist checking is disabled, return false
	if !bc.IsEnabled() {
		return false
	}

	// Don't check zero address
	if address == (common.Address{}) {
		return false
	}

	// Check if the blocklist contract exists
	if !statedb.Exist(WalletBlocklistContractAddress) {
		// Contract doesn't exist yet, blocklist not active
		return false
	}

	// Prepare the call to isBlocklisted(address) function
	// Function signature: isBlocklisted(address) returns (bool)
	// Function selector: 0xfe575a87
	data := make([]byte, 36)
	copy(data[0:4], []byte{0xfe, 0x57, 0x5a, 0x87}) // isBlocklisted function selector
	copy(data[16:36], address.Bytes())              // address parameter (padded to 32 bytes)

	// Create a fake EVM context for the call
	context := vm.BlockContext{
		CanTransfer: CanTransfer,
		Transfer:    Transfer,
		GetHash:     func(uint64) common.Hash { return common.Hash{} },
		Coinbase:    common.Address{},
		BlockNumber: blockNumber,
		Time:        new(big.Int),
		Difficulty:  new(big.Int),
		GasLimit:    10000000,
		BaseFee:     new(big.Int),
	}

	txContext := vm.TxContext{
		Origin:   common.Address{},
		GasPrice: new(big.Int),
	}

	evm := vm.NewEVM(context, txContext, statedb, config, vm.Config{})

	// Call the contract
	ret, _, err := evm.StaticCall(
		vm.AccountRef(common.Address{}),
		WalletBlocklistContractAddress,
		data,
		10000000, // gas limit
	)

	if err != nil {
		log.Debug("Failed to check blocklist", "address", address.Hex(), "error", err)
		return false
	}

	// Parse the return value (bool)
	if len(ret) != 32 {
		log.Debug("Invalid blocklist response length", "address", address.Hex(), "length", len(ret))
		return false
	}

	// Check if the last byte is non-zero (true)
	isBlocked := ret[31] != 0

	if isBlocked {
		log.Info("Address is blocklisted", "address", address.Hex())
	}

	return isBlocked
}

// CheckTransactionBlocklist checks both sender and recipient addresses for blocklist status
func (bc *BlocklistChecker) CheckTransactionBlocklist(statedb vm.StateDB, from common.Address, to *common.Address, config *params.ChainConfig, blockNumber *big.Int) error {
	// Check sender
	if bc.IsBlocklisted(statedb, from, config, blockNumber) {
		log.Warn("Transaction rejected: sender is blocklisted", "from", from.Hex())
		return ErrSenderBlocklisted
	}

	// Check recipient (if not contract creation)
	if to != nil && *to != (common.Address{}) {
		if bc.IsBlocklisted(statedb, *to, config, blockNumber) {
			log.Warn("Transaction rejected: recipient is blocklisted", "to", to.Hex())
			return ErrRecipientBlocklisted
		}
	}

	return nil
}

// SetBlocklistContractAddress allows updating the blocklist contract address
// This should be called during initialization if a different address is used
func SetBlocklistContractAddress(address common.Address) {
	WalletBlocklistContractAddress = address
	log.Info("Blocklist contract address updated", "address", address.Hex())
}
