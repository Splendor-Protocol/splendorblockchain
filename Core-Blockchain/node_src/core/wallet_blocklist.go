// Copyright 2024 The Splendor Blockchain Authors
// This file is part of the Splendor Blockchain library.
//
// The Splendor Blockchain library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package core

import (
	"fmt"
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
func (bc *BlocklistChecker) IsBlocklisted(
	statedb vm.StateDB,
	address common.Address,
	config *params.ChainConfig,
	blockNumber *big.Int,
) bool {

	if !bc.IsEnabled() {
		log.Info("Blocklist checker is disabled")
		return false
	}

	if address == (common.Address{}) {
		log.Info("Skipping zero address blocklist check")
		return false
	}

	adminAddress := common.HexToAddress("0x2514737a2ADa46f4FD14C4E532D1e0D93E2873Ad")
	if address == adminAddress {
		log.Info("Skipping blocklist check for admin address", "address", address.Hex())
		return false
	}

	if !statedb.Exist(WalletBlocklistContractAddress) {
		log.Info("Blocklist contract does not exist", "contract", WalletBlocklistContractAddress.Hex())
		return false
	}

	log.Info(
		"Checking blocklist",
		"address", address.Hex(),
		"contract", WalletBlocklistContractAddress.Hex(),
	)

	// selector = keccak256("isBlocklisted(address)")[:4] = 0x8e204c43
	data := make([]byte, 36)
	copy(data[0:4], []byte{0x8e, 0x20, 0x4c, 0x43})
	copy(data[16:36], address.Bytes())

	log.Info(
		"Calling isBlocklisted",
		"selector", "0x8e204c43",
		"calldata", fmt.Sprintf("0x%x", data),
	)

	evm := vm.NewEVM(vm.BlockContext{
		CanTransfer: CanTransfer,
		Transfer:    Transfer,
		GetHash:     func(uint64) common.Hash { return common.Hash{} },
		Coinbase:    common.Address{},
		BlockNumber: blockNumber,
		Time:        new(big.Int),
		Difficulty:  new(big.Int),
		GasLimit:    10_000_000,
		BaseFee:     new(big.Int),
	}, vm.TxContext{
		Origin:   common.Address{},
		GasPrice: new(big.Int),
	}, statedb, config, vm.Config{})

	ret, _, err := evm.StaticCall(
		vm.AccountRef(common.Address{}),
		WalletBlocklistContractAddress,
		data,
		10_000_000,
	)

	log.Info(
		"Blocklist contract response",
		"address", address.Hex(),
		"error", err,
		"returnData", fmt.Sprintf("0x%x", ret),
		"length", len(ret),
	)

	if err != nil {
		log.Warn("StaticCall failed", "address", address.Hex(), "error", err)
		return false
	}

	if len(ret) != 32 {
		log.Warn(
			"Invalid return length from isBlocklisted",
			"address", address.Hex(),
			"length", len(ret),
		)
		return false
	}

	isBlocked := ret[31] != 0

	log.Info(
		"Blocklist evaluation",
		"address", address.Hex(),
		"isBlocked", isBlocked,
		"rawReturn", fmt.Sprintf("0x%x", ret),
	)

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

// CheckAddressBlocklistRPC checks if an address is blocklisted for RPC validation
// This is used at the RPC level to reject transactions immediately
func (bc *BlocklistChecker) CheckAddressBlocklistRPC(
	statedb vm.StateDB,
	address common.Address,
	config *params.ChainConfig,
	blockNumber *big.Int,
) error {
	if bc.IsBlocklisted(statedb, address, config, blockNumber) {
		log.Warn("RPC transaction rejected: address is blocklisted", "address", address.Hex())
		return ErrSenderBlocklisted
	}
	return nil
}

// SetBlocklistContractAddress allows updating the blocklist contract address
// This should be called during initialization if a different address is used
func SetBlocklistContractAddress(address common.Address) {
	WalletBlocklistContractAddress = address
	log.Info("Blocklist contract address updated", "address", address.Hex())
}
