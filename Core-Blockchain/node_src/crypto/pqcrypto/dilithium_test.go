// Copyright 2025 Splendor Blockchain Authors
// Post-Quantum Cryptography Tests

package pqcrypto

import (
	"crypto/rand"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

func TestDilithiumKeyGeneration(t *testing.T) {
	// Test Dilithium key pair generation
	kp, err := dilithiumKeygen()
	if err != nil {
		t.Fatalf("Failed to generate Dilithium key pair: %v", err)
	}

	if len(kp.PublicKey) != DilithiumPublicKeySize {
		t.Errorf("Invalid public key size: got %d, want %d", len(kp.PublicKey), DilithiumPublicKeySize)
	}

	if len(kp.PrivateKey) != DilithiumPrivateKeySize {
		t.Errorf("Invalid private key size: got %d, want %d", len(kp.PrivateKey), DilithiumPrivateKeySize)
	}
}

func TestDilithiumSignAndVerify(t *testing.T) {
	// Generate key pair
	kp, err := dilithiumKeygen()
	if err != nil {
		t.Fatalf("Failed to generate key pair: %v", err)
	}

	// Test message
	message := []byte("Hello, Post-Quantum World!")

	// Sign message
	signature, err := dilithiumSign(kp.PrivateKey, message)
	if err != nil {
		t.Fatalf("Failed to sign message: %v", err)
	}

	if len(signature) != DilithiumSignatureSize {
		t.Errorf("Invalid signature size: got %d, want %d", len(signature), DilithiumSignatureSize)
	}

	// Verify signature
	valid := dilithiumVerify(kp.PublicKey, message, signature)
	if !valid {
		t.Error("Signature verification failed")
	}

	// Test with wrong message
	wrongMessage := []byte("Wrong message")
	validWrong := dilithiumVerify(kp.PublicKey, wrongMessage, signature)
	if validWrong {
		t.Error("Signature should not verify with wrong message")
	}
}

func TestHybridKeyPairGeneration(t *testing.T) {
	// Generate hybrid key pair
	hkp, err := GenerateHybridKeyPair()
	if err != nil {
		t.Fatalf("Failed to generate hybrid key pair: %v", err)
	}

	if hkp.ECDSA == nil {
		t.Error("ECDSA key is nil")
	}

	if hkp.Dilithium == nil {
		t.Error("Dilithium key is nil")
	}

	if hkp.Type != AccountTypeHybrid {
		t.Errorf("Invalid account type: got %d, want %d", hkp.Type, AccountTypeHybrid)
	}

	// Verify address derivation
	expectedAddr := crypto.PubkeyToAddress(hkp.ECDSA.PublicKey)
	if hkp.Address != expectedAddr {
		t.Errorf("Address mismatch: got %s, want %s", hkp.Address.Hex(), expectedAddr.Hex())
	}
}

func TestHybridSignAndVerify(t *testing.T) {
	// Generate hybrid key pair
	hkp, err := GenerateHybridKeyPair()
	if err != nil {
		t.Fatalf("Failed to generate hybrid key pair: %v", err)
	}

	// Test message hash
	message := []byte("Test hybrid signature")
	hash := crypto.Keccak256(message)

	// Create hybrid signature
	hybridSig, err := hkp.SignHybrid(hash)
	if err != nil {
		t.Fatalf("Failed to create hybrid signature: %v", err)
	}

	if hybridSig.Type != AccountTypeHybrid {
		t.Errorf("Invalid signature type: got %d, want %d", hybridSig.Type, AccountTypeHybrid)
	}

	// Verify hybrid signature
	ecdsaPubKey := crypto.FromECDSAPub(&hkp.ECDSA.PublicKey)
	valid := VerifyHybrid(hash, hybridSig, ecdsaPubKey, hkp.Dilithium.PublicKey)
	if !valid {
		t.Error("Hybrid signature verification failed")
	}

	// Test serialization and deserialization
	serialized := hybridSig.Serialize()
	deserialized, err := DeserializeHybridSignature(serialized)
	if err != nil {
		t.Fatalf("Failed to deserialize hybrid signature: %v", err)
	}

	// Verify deserialized signature
	validDeserialized := VerifyHybrid(hash, deserialized, ecdsaPubKey, hkp.Dilithium.PublicKey)
	if !validDeserialized {
		t.Error("Deserialized hybrid signature verification failed")
	}
}

func TestHybridSignatureCompatibility(t *testing.T) {
	// Generate hybrid key pair
	hkp, err := GenerateHybridKeyPair()
	if err != nil {
		t.Fatalf("Failed to generate hybrid key pair: %v", err)
	}

	// Test message hash
	message := []byte("Test compatibility")
	hash := crypto.Keccak256(message)

	// Create hybrid signature
	hybridSig, err := hkp.SignHybrid(hash)
	if err != nil {
		t.Fatalf("Failed to create hybrid signature: %v", err)
	}

	// Test ECDSA extraction
	ecdsaSig := hybridSig.GetECDSASignature()
	if len(ecdsaSig) != crypto.SignatureLength {
		t.Errorf("Invalid ECDSA signature length: got %d, want %d", len(ecdsaSig), crypto.SignatureLength)
	}

	// Verify ECDSA part separately
	ecdsaPubKey := crypto.FromECDSAPub(&hkp.ECDSA.PublicKey)
	ecdsaValid := crypto.VerifySignature(ecdsaPubKey, hash, ecdsaSig[:64])
	if !ecdsaValid {
		t.Error("ECDSA part of hybrid signature is invalid")
	}

	// Test quantum safety check
	if !hybridSig.IsQuantumSafe() {
		t.Error("Hybrid signature should be quantum safe")
	}
}

func TestAddressDerivation(t *testing.T) {
	// Generate Dilithium key pair
	kp, err := dilithiumKeygen()
	if err != nil {
		t.Fatalf("Failed to generate Dilithium key pair: %v", err)
	}

	// Derive address from Dilithium public key
	addr := DeriveAddressFromDilithiumKey(kp.PublicKey)

	// Address should be 20 bytes
	if len(addr) != common.AddressLength {
		t.Errorf("Invalid address length: got %d, want %d", len(addr), common.AddressLength)
	}

	// Address should not be zero
	zeroAddr := common.Address{}
	if addr == zeroAddr {
		t.Error("Derived address should not be zero")
	}
}

func TestHybridSignatureTypes(t *testing.T) {
	// Test different signature types
	testCases := []struct {
		name     string
		sigType  uint8
		expected bool
	}{
		{"Legacy", AccountTypeLegacy, false},
		{"Hybrid", AccountTypeHybrid, true},
		{"PQC Only", AccountTypePQCOnly, true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			sig := &HybridSignature{Type: tc.sigType}
			if sig.IsQuantumSafe() != tc.expected {
				t.Errorf("IsQuantumSafe() = %v, want %v for type %d", sig.IsQuantumSafe(), tc.expected, tc.sigType)
			}
		})
	}
}

func BenchmarkDilithiumKeygen(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_, err := dilithiumKeygen()
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkDilithiumSign(b *testing.B) {
	kp, err := dilithiumKeygen()
	if err != nil {
		b.Fatal(err)
	}

	message := make([]byte, 32)
	rand.Read(message)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := dilithiumSign(kp.PrivateKey, message)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkDilithiumVerify(b *testing.B) {
	kp, err := dilithiumKeygen()
	if err != nil {
		b.Fatal(err)
	}

	message := make([]byte, 32)
	rand.Read(message)

	signature, err := dilithiumSign(kp.PrivateKey, message)
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		valid := dilithiumVerify(kp.PublicKey, message, signature)
		if !valid {
			b.Fatal("Verification failed")
		}
	}
}

func BenchmarkHybridSign(b *testing.B) {
	hkp, err := GenerateHybridKeyPair()
	if err != nil {
		b.Fatal(err)
	}

	hash := make([]byte, 32)
	rand.Read(hash)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := hkp.SignHybrid(hash)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkHybridVerify(b *testing.B) {
	hkp, err := GenerateHybridKeyPair()
	if err != nil {
		b.Fatal(err)
	}

	hash := make([]byte, 32)
	rand.Read(hash)

	hybridSig, err := hkp.SignHybrid(hash)
	if err != nil {
		b.Fatal(err)
	}

	ecdsaPubKey := crypto.FromECDSAPub(&hkp.ECDSA.PublicKey)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		valid := VerifyHybrid(hash, hybridSig, ecdsaPubKey, hkp.Dilithium.PublicKey)
		if !valid {
			b.Fatal("Verification failed")
		}
	}
}
