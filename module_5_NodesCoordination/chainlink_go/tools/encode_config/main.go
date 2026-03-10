package main

import (
	"encoding/hex"
	"fmt"
	"math"
	"os"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/smartcontractkit/libocr/offchainreporting/confighelper"
	ocrtypes "github.com/smartcontractkit/libocr/offchainreporting/types"
	"golang.org/x/crypto/curve25519"
)

func mustStripPrefix(s, prefix string) string {
	if strings.HasPrefix(s, prefix) {
		return strings.TrimPrefix(s, prefix)
	}
	return s
}

func mustHexDecode(label, hexStr string) []byte {
	b, err := hex.DecodeString(hexStr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: invalid %s hex: %v\n", label, err)
		os.Exit(1)
	}
	return b
}

func main() {
		// Input values from your Chainlink node (OCR key bundle + transmitter).
		// Note: OCR with 1 oracle implies f=0 (not fault-tolerant); this is only useful for testing.
		const (
			configPubKey = "ocrcfg_32916e5c900a95d20aa07579c1bc9066a76d6f9b10712969cf90b637a6fb6262"
			signingAddr  = "ocrsad_0x63039ae87e2e80b2f5928b60dc1e458400704b6e"
			offchainKey  = "ocroff_c67b4b867df79be54e0e60b6499dfa1076601eb02c7c900186cba39ffc5b0353"
			peerID       = "p2p_12D3KooWJDa4ezs8fSoj7t1WygkUGNXTou9A1GR1yM74VX8APmP5"
			transmitAddr = "0x1C3770a95b98C37cEa30bc5f7bCafbD05cAfdD4E"
		)

	cfgPubKeyHex := mustStripPrefix(configPubKey, "ocrcfg_")
	signingAddrHex := mustStripPrefix(signingAddr, "ocrsad_")
	offchainPubKeyHex := mustStripPrefix(offchainKey, "ocroff_")
	peerIDStr := mustStripPrefix(peerID, "p2p_")

	cfgPubKeyBytes := mustHexDecode("config_pubkey", cfgPubKeyHex)
	if len(cfgPubKeyBytes) != curve25519.PointSize {
		fmt.Fprintf(os.Stderr, "ERROR: config_pubkey must be %d bytes, got %d\n", curve25519.PointSize, len(cfgPubKeyBytes))
		os.Exit(1)
	}
	var sharedSecretEncPubKey [curve25519.PointSize]byte
	copy(sharedSecretEncPubKey[:], cfgPubKeyBytes)

	offchainPubKeyBytes := mustHexDecode("offchain_pubkey", offchainPubKeyHex)
	if len(offchainPubKeyBytes) != curve25519.PointSize {
		fmt.Fprintf(os.Stderr, "ERROR: offchain_pubkey must be %d bytes, got %d\n", curve25519.PointSize, len(offchainPubKeyBytes))
		os.Exit(1)
	}

	oracles := []confighelper.OracleIdentityExtra{
		{
			OracleIdentity: confighelper.OracleIdentity{
				OnChainSigningAddress: ocrtypes.OnChainSigningAddress(common.HexToAddress(signingAddrHex)),
				TransmitAddress:       common.HexToAddress(transmitAddr),
				OffchainPublicKey:     ocrtypes.OffchainPublicKey(offchainPubKeyBytes),
				PeerID:                peerIDStr,
			},
			SharedSecretEncryptionPublicKey: sharedSecretEncPubKey,
		},
	}

	// You can tune these. Keep deltaGrace < deltaRound < deltaProgress.
	deltaProgress := 30 * time.Second
	deltaResend := 20 * time.Second
	deltaRound := 20 * time.Second
	deltaGrace := 2 * time.Second
	deltaC := time.Duration(math.MaxInt64) // effectively "never" for constant median
	alphaPPB := uint64(1)
	deltaStage := 10 * time.Second
	rMax := uint8(5)
	transmitDelays := []int{0}
	f := 0

	_, _, _, _, encodedConfig, err := confighelper.ContractSetConfigArgs(
		deltaProgress,
		deltaResend,
		deltaRound,
		deltaGrace,
		deltaC,
		alphaPPB,
		deltaStage,
		rMax,
		transmitDelays,
		oracles,
		f,
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to generate config: %v\n", err)
		os.Exit(1)
	}

	fmt.Print(hex.EncodeToString(encodedConfig))
}
