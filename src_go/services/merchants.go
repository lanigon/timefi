package services

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strings"

	"github.com/Guesstrain/EthBankok/config"
	"github.com/Guesstrain/EthBankok/models"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type MerchantService interface {
	AddMerchant(merchant *models.Merchants) error
	GetMerchantByID(id uint) (models.Merchants, error)
	GetAllMerchants() ([]models.Merchants, error)
	GetMerchantByAddress(address string) (models.Merchants, error)
}

const (
	infuraURL          = "https://sepolia.infura.io/v3/d68e6d7c2e5c42fbb30fe563ada8f432" // Replace with your Infura URL
	privateKeyHex      = ""                                                              // Replace with your wallet's private key
	contractAddressHex = "0xDb90007b986c2711d3814b1760EDC3b2DfB71e76"                    // Replace with your deployed contract address
	contractABI        = `[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_greeting",
				"type": "string"
			}
		],
		"name": "setGreeting",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "getGreeting",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "greeting",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`
)

type MerchantServiceImpl struct{}

func (m *MerchantServiceImpl) AddMerchant(merchant *models.Merchants) error {
	return config.CreateMerchant(merchant)
}

// GetMerchantByID retrieves a merchant by ID
func (m *MerchantServiceImpl) GetMerchantByID(id uint) (models.Merchants, error) {
	return config.GetMerchantByID(id)
}

func (m *MerchantServiceImpl) GetMerchantByAddress(address string) (models.Merchants, error) {
	return config.GetMerchantByAddress(address)
}

// GetAllMerchants retrieves all merchants
func (m *MerchantServiceImpl) GetAllMerchants() ([]models.Merchants, error) {
	return config.GetAllMerchants()
}

func NewMerchantService() MerchantService {
	return &MerchantServiceImpl{}
}

func GetCredit(merchant models.Merchants) (models.Merchants, error) {
	apiURL := fmt.Sprintf("https://example.com/api/get-credit?address=%s", merchant.Address)

	// Create HTTP GET request
	resp, err := http.Get(apiURL)
	if err != nil {
		return merchant, fmt.Errorf("failed to call API: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return merchant, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return merchant, fmt.Errorf("failed to read API response: %v", err)
	}

	var result struct {
		Credit float64 `json:"credit"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return merchant, fmt.Errorf("failed to parse API response: %v", err)
	}

	merchant.Credit = result.Credit

	return merchant, nil
}

func CallRefundContract() error {
	client, err := ethclient.Dial(infuraURL)
	if err != nil {
		return fmt.Errorf("Failed to connect to Ethereum client: %v", err)
	}
	defer client.Close()

	// Load the ABI
	contractABI := `[{"constant":false,"inputs":[],"name":"triggerRepayments","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]`
	parsedABI, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		return fmt.Errorf("Failed to parse contract ABI: %v", err)
	}

	// Create contract instance
	repaymentManagerAddress := common.HexToAddress(contractAddressHex)

	// Load the private key
	privateKey, err := crypto.HexToECDSA("YOUR_PRIVATE_KEY")
	if err != nil {
		return fmt.Errorf("Failed to load private key: %v", err)
	}

	// Get the public address
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return fmt.Errorf("Cannot assert type: publicKey is not of type *ecdsa.PublicKey")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Get the nonce
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		return fmt.Errorf("Failed to get nonce: %v", err)
	}

	// Get the gas price
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		return fmt.Errorf("Failed to get gas price: %v", err)
	}

	// Pack the method call
	callData, err := parsedABI.Pack("triggerRepayments")
	if err != nil {
		return fmt.Errorf("Failed to pack triggerRepayments call: %v", err)
	}

	// Estimate gas
	gasLimit, err := client.EstimateGas(context.Background(), ethereum.CallMsg{
		To:   &repaymentManagerAddress,
		Data: callData,
	})
	if err != nil {
		return fmt.Errorf("Failed to estimate gas: %v", err)
	}

	// Create the transaction
	tx := types.NewTransaction(nonce, repaymentManagerAddress, big.NewInt(0), gasLimit, gasPrice, callData)

	// Sign the transaction
	chainID := big.NewInt(11155111) // Sepolia testnet chain ID
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		return fmt.Errorf("Failed to sign transaction: %v", err)
	}

	// Send the transaction
	err = client.SendTransaction(context.Background(), signedTx)
	if err != nil {
		return fmt.Errorf("Failed to send transaction: %v", err)
	}

	fmt.Printf("Transaction sent: %s\n", signedTx.Hash().Hex())
	return nil
}
