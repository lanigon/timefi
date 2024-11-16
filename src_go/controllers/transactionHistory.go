package controllers

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/Guesstrain/EthBankok/models"
	"github.com/Guesstrain/EthBankok/services"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"
)

const (
	infuraURL              = "https://sepolia.infura.io/v3/d68e6d7c2e5c42fbb30fe563ada8f432"
	infuraURLPoly          = "https://polygon-amoy.infura.io/v3/d68e6d7c2e5c42fbb30fe563ada8f432"
	contractAddressHex     = "0xAF7785F8dDFC9629949eDdb07Ba14d53Fc853C14"
	contractAddressHexPloy = "0xB626C2801Dc36801eCC7D0E876451943FF0D36de"
	privateKeyHex          = "" // Replace with your wallet's private key
	walletAddressHex       = "0xDb90007b986c2711d3814b1760EDC3b2DfB71e76"
	contractABI            = `[
{
"inputs": [
{
"internalType": "string",
"name": "name_",
"type": "string"
},
{
"internalType": "string",
"name": "symbol_",
"type": "string"
}
],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"inputs": [
{
"internalType": "address",
"name": "spender",
"type": "address"
},
{
"internalType": "uint256",
"name": "allowance",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "needed",
"type": "uint256"
}
],
"name": "ERC20InsufficientAllowance",
"type": "error"
},
{
"inputs": [
{
"internalType": "address",
"name": "sender",
"type": "address"
},
{
"internalType": "uint256",
"name": "balance",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "needed",
"type": "uint256"
}
],
"name": "ERC20InsufficientBalance",
"type": "error"
},
{
"inputs": [
{
"internalType": "address",
"name": "approver",
"type": "address"
}
],
"name": "ERC20InvalidApprover",
"type": "error"
},
{
"inputs": [
{
"internalType": "address",
"name": "receiver",
"type": "address"
}
],
"name": "ERC20InvalidReceiver",
"type": "error"
},
{
"inputs": [
{
"internalType": "address",
"name": "sender",
"type": "address"
}
],
"name": "ERC20InvalidSender",
"type": "error"
},
{
"inputs": [
{
"internalType": "address",
"name": "spender",
"type": "address"
}
],
"name": "ERC20InvalidSpender",
"type": "error"
},
{
"inputs": [
{
"internalType": "address",
"name": "owner",
"type": "address"
}
],
"name": "OwnableInvalidOwner",
"type": "error"
},
{
"inputs": [
{
"internalType": "address",
"name": "account",
"type": "address"
}
],
"name": "OwnableUnauthorizedAccount",
"type": "error"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "owner",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "spender",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "value",
"type": "uint256"
}
],
"name": "Approval",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "user",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "merchant",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amount",
"type": "uint256"
},
{
"indexed": false,
"internalType": "uint256",
"name": "dueDate",
"type": "uint256"
},
{
"indexed": false,
"internalType": "uint256",
"name": "loanId",
"type": "uint256"
}
],
"name": "LoanGiven",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "merchant",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "user",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amount",
"type": "uint256"
},
{
"indexed": false,
"internalType": "uint256",
"name": "loanId",
"type": "uint256"
}
],
"name": "LoanRepaid",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "merchant",
"type": "address"
},
{
"indexed": false,
"internalType": "address",
"name": "spender",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amountApproved",
"type": "uint256"
}
],
"name": "MerchantInitialized",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "previousOwner",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "newOwner",
"type": "address"
}
],
"name": "OwnershipTransferred",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "newRepaymentManager",
"type": "address"
}
],
"name": "RepaymentManagerSet",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "from",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "to",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "value",
"type": "uint256"
}
],
"name": "Transfer",
"type": "event"
},
{
"inputs": [
{
"internalType": "address",
"name": "owner",
"type": "address"
},
{
"internalType": "address",
"name": "spender",
"type": "address"
}
],
"name": "allowance",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "spender",
"type": "address"
},
{
"internalType": "uint256",
"name": "value",
"type": "uint256"
}
],
"name": "approve",
"outputs": [
{
"internalType": "bool",
"name": "",
"type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "account",
"type": "address"
}
],
"name": "balanceOf",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "checkUpkeep",
"outputs": [
{
"internalType": "bool",
"name": "upkeepNeeded",
"type": "bool"
},
{
"internalType": "uint256[]",
"name": "loanIdsToRepay",
"type": "uint256[]"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "decimals",
"outputs": [
{
"internalType": "uint8",
"name": "",
"type": "uint8"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "user",
"type": "address"
},
{
"internalType": "address",
"name": "merchant",
"type": "address"
}
],
"name": "getLoansBetween",
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
"inputs": [
{
"internalType": "address",
"name": "merchant",
"type": "address"
}
],
"name": "getTransactions",
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
"inputs": [
{
"internalType": "uint256",
"name": "amount",
"type": "uint256"
}
],
"name": "initializeMerchantApproval",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "merchant",
"type": "address"
},
{
"internalType": "uint256",
"name": "amount",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "daysUntilDue",
"type": "uint256"
}
],
"name": "lendToMerchant",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "",
"type": "address"
},
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"name": "loanCount",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "",
"type": "address"
},
{
"internalType": "address",
"name": "",
"type": "address"
},
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"name": "loanIds",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"name": "loans",
"outputs": [
{
"internalType": "uint256",
"name": "loanId",
"type": "uint256"
},
{
"internalType": "address",
"name": "buyer",
"type": "address"
},
{
"internalType": "address",
"name": "merchant",
"type": "address"
},
{
"internalType": "uint256",
"name": "amount",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "dueDate",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "repaidAmount",
"type": "uint256"
},
{
"internalType": "bool",
"name": "isRepaid",
"type": "bool"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"name": "merchantCurrentLoans",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"name": "merchantMaxLoanLimits",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "name",
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
"name": "nextLoanId",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "owner",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "uint256[]",
"name": "loanIdsToRepay",
"type": "uint256[]"
}
],
"name": "performUpkeep",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "renounceOwnership",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "user",
"type": "address"
},
{
"internalType": "uint256",
"name": "loanId",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "amount",
"type": "uint256"
}
],
"name": "repayLoan",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "repaymentManager",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "merchant",
"type": "address"
},
{
"internalType": "uint256",
"name": "maxLimit",
"type": "uint256"
}
],
"name": "setMerchantMaxLoanLimit",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "_repaymentManager",
"type": "address"
}
],
"name": "setRepaymentManager",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "symbol",
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
"name": "totalSupply",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "to",
"type": "address"
},
{
"internalType": "uint256",
"name": "value",
"type": "uint256"
}
],
"name": "transfer",
"outputs": [
{
"internalType": "bool",
"name": "",
"type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "from",
"type": "address"
},
{
"internalType": "address",
"name": "to",
"type": "address"
},
{
"internalType": "uint256",
"name": "value",
"type": "uint256"
}
],
"name": "transferFrom",
"outputs": [
{
"internalType": "bool",
"name": "",
"type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "newOwner",
"type": "address"
}
],
"name": "transferOwnership",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
}
]

自动还款合约[
{
"inputs": [],
"name": "checkUpkeep",
"outputs": [
{
"internalType": "bool",
"name": "upkeepNeeded",
"type": "bool"
},
{
"internalType": "uint256[]",
"name": "loanIdsToRepay",
"type": "uint256[]"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "uint256[]",
"name": "loanIdsToRepay",
"type": "uint256[]"
}
],
"name": "performUpkeep",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
}
]
`
)

func GetTransactionHistory(c *gin.Context) {
	TransactionList := make([]models.Transaction, 0)
	TargetParam := c.Query("target")
	targetAddress := common.HexToAddress(TargetParam)

	client, err := ethclient.Dial("https://sepolia.infura.io/v3/d68e6d7c2e5c42fbb30fe563ada8f432")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the Ethereum client"})
		return
	}
	contractAddress := common.HexToAddress(contractAddressHex)

	parsedABI, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse ABI"})
		return
	}

	lendEvent := parsedABI.Events["LoanGiven"]

	lendQuery := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
		Topics: [][]common.Hash{
			{lendEvent.ID},
			{common.BytesToHash(targetAddress.Bytes())},
		},
	}

	Lendlogs, err := client.FilterLogs(context.Background(), lendQuery)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to filter logs"})
		return
	}
	for _, lLog := range Lendlogs {
		event, err := parsedABI.Unpack("Transfer", lLog.Data)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unpack event data"})
			return
		}

		from := lLog.Topics[1].Hex()
		to := lLog.Topics[2].Hex()
		value := event[0].(*big.Int)
		TransactionList = append(TransactionList, models.Transaction{from, to, value})

		fmt.Printf("lend from: %s, to: %s, value: %s\n", from, to, value.String())
	}

	c.JSON(http.StatusOK, TransactionList)
}

func GetTransactionHistoryMerchants(c *gin.Context) {
	TransactionList := make([]models.Transaction, 0)
	TargetParam := c.Query("target")
	targetAddress := common.HexToAddress(TargetParam)

	client, err := ethclient.Dial("https://sepolia.infura.io/v3/d68e6d7c2e5c42fbb30fe563ada8f432")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the Ethereum client"})
		return
	}
	contractAddress := common.HexToAddress(contractAddressHex)

	parsedABI, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse ABI"})
		return
	}

	lendEvent := parsedABI.Events["LoanGiven"]

	lendQuery := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
		Topics: [][]common.Hash{
			{lendEvent.ID},
			nil,
			{common.BytesToHash(targetAddress.Bytes())},
		},
	}

	Lendlogs, err := client.FilterLogs(context.Background(), lendQuery)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to filter logs"})
		return
	}
	for _, lLog := range Lendlogs {
		event := struct {
			Amount  *big.Int
			DueDate *big.Int
			LoanId  *big.Int
		}{}
		err = parsedABI.UnpackIntoInterface(&event, "LoanGiven", lLog.Data)

		from := lLog.Topics[1].Hex()
		to := lLog.Topics[2].Hex()
		fmt.Println("DueDate: ", event.DueDate)
		fmt.Println("LoanId: ", event.LoanId)
		value := event.Amount
		TransactionList = append(TransactionList, models.Transaction{from, to, value})

		fmt.Printf("lend from: %s, to: %s, value: %s\n", from, to, value.String())
	}

	c.JSON(http.StatusOK, TransactionList)
}

func GetAllLoans(c *gin.Context) error {
	TargetParam := c.Query("target")

	// Connect to the Ethereum network
	client, err := ethclient.Dial(infuraURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// Create an instance of the contract
	contractAddr := common.HexToAddress(contractAddressHex)
	merchantAddr := common.HexToAddress(TargetParam)

	// Use the ABI encoding to generate the appropriate call data for `getTransactions()`
	// Here, we assume you've already parsed the contract ABI
	contractAbi, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		log.Fatalf("Failed to parse ABI: %v", err)
	}

	// Pack the arguments for the `getTransactions` function
	data, err := contractAbi.Pack("getTransactions", merchantAddr)
	if err != nil {
		log.Fatalf("Failed to pack arguments: %v", err)
	}

	// Prepare call message to invoke the contract
	callMsg := ethereum.CallMsg{
		To:   &contractAddr,
		Data: data,
	}

	// Execute the call
	result, err := client.CallContract(context.Background(), callMsg, nil)
	if err != nil {
		log.Fatalf("Error while calling the getTransactions function: %v", err)
	}
	var loans []models.Loan
	var jsonString string
	err = contractAbi.UnpackIntoInterface(&jsonString, "getTransactions", result)
	if err != nil {
		log.Fatalf("Failed to unpack result: %v", err)
	}
	cleanedString := strings.TrimSpace(jsonString)
	cleanedString2 := strings.TrimPrefix(cleanedString, "~")
	err = json.Unmarshal([]byte(cleanedString2), &loans)
	if err != nil {
		log.Fatalf("Failed to unmarshal JSON: %v", err)
	}
	c.JSON(http.StatusOK, loans)
	return nil
}

func GetAllLoansPoly(c *gin.Context) error {
	TargetParam := c.Query("target")

	// Connect to the Ethereum network
	client, err := ethclient.Dial(infuraURLPoly)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// Create an instance of the contract
	contractAddr := common.HexToAddress(contractAddressHexPloy)
	merchantAddr := common.HexToAddress(TargetParam)

	// Use the ABI encoding to generate the appropriate call data for `getTransactions()`
	// Here, we assume you've already parsed the contract ABI
	contractAbi, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		log.Fatalf("Failed to parse ABI: %v", err)
	}

	// Pack the arguments for the `getTransactions` function
	data, err := contractAbi.Pack("getTransactions", merchantAddr)
	if err != nil {
		log.Fatalf("Failed to pack arguments: %v", err)
	}

	// Prepare call message to invoke the contract
	callMsg := ethereum.CallMsg{
		To:   &contractAddr,
		Data: data,
	}

	// Execute the call
	result, err := client.CallContract(context.Background(), callMsg, nil)
	if err != nil {
		log.Fatalf("Error while calling the getTransactions function: %v", err)
	}
	var loans []models.Loan
	var jsonString string
	err = contractAbi.UnpackIntoInterface(&jsonString, "getTransactions", result)
	if err != nil {
		log.Fatalf("Failed to unpack result: %v", err)
	}
	cleanedString := strings.TrimSpace(jsonString)
	cleanedString2 := strings.TrimPrefix(cleanedString, "~")
	err = json.Unmarshal([]byte(cleanedString2), &loans)
	if err != nil {
		log.Fatalf("Failed to unmarshal JSON: %v", err)
	}
	c.JSON(http.StatusOK, loans)
	return nil
}

func GetMerchantLoans(address string) []models.Loan {
	// Connect to the Ethereum network
	client, err := ethclient.Dial(infuraURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// Create an instance of the contract
	contractAddr := common.HexToAddress(contractAddressHex)
	merchantAddr := common.HexToAddress(address)

	contractAbi, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		log.Fatalf("Failed to parse ABI: %v", err)
	}

	// Pack the arguments for the `getTransactions` function
	data, err := contractAbi.Pack("getTransactions", merchantAddr)
	if err != nil {
		log.Fatalf("Failed to pack arguments: %v", err)
	}

	// Prepare call message to invoke the contract
	callMsg := ethereum.CallMsg{
		To:   &contractAddr,
		Data: data,
	}

	// Execute the call
	result, err := client.CallContract(context.Background(), callMsg, nil)
	if err != nil {
		log.Fatalf("Error while calling the getTransactions function: %v", err)
	}
	var loans []models.Loan
	var jsonString string
	err = contractAbi.UnpackIntoInterface(&jsonString, "getTransactions", result)
	if err != nil {
		log.Fatalf("Failed to unpack result: %v", err)
	}
	cleanedString := strings.TrimSpace(jsonString)
	cleanedString2 := strings.TrimPrefix(cleanedString, "~")
	err = json.Unmarshal([]byte(cleanedString2), &loans)
	if err != nil {
		log.Fatalf("Failed to unmarshal JSON: %v", err)
	}
	return loans
}

func BackupLoans() {
	merchantService := services.NewMerchantService()
	merchants, _ := merchantService.GetAllMerchants()
	var totalLoans []models.Loan
	for _, merchant := range merchants {
		loans := GetMerchantLoans(merchant.Address)
		totalLoans = append(totalLoans, loans...)
	}

	loansJSON, err := json.MarshalIndent(totalLoans, "", "  ")
	if err != nil {
		fmt.Printf("Failed to marshal loans to JSON: %v\n", err)
		return
	}

	// Create the file name with current timestamp
	timestamp := time.Now().Format("20060102_150405") // Use timestamp format: YYYYMMDD_HHMMSS
	fileName := fmt.Sprintf("loans_%s.json", timestamp)

	// Create and write to the JSON file
	file, err := os.Create(fileName)
	if err != nil {
		fmt.Printf("Failed to create JSON file: %v\n", err)
		return
	}
	defer file.Close()

	_, err = file.Write(loansJSON)
	if err != nil {
		fmt.Printf("Failed to write to JSON file: %v\n", err)
		return
	}

	cmd := exec.Command("/Users/administrator/Desktop/code/go/akavesdk/bin/akavecli", "ipc", "file", "upload", "ethbankok", fileName,
		"--node-address=connect.akave.ai:5500",
		"--private-key=433612ce7e05c67da37b1f421bd6dfa5b8d26415b389c570443324994e82954d")
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}

	// Print the output
	fmt.Printf("Command Output:\n%s\n", output)
}

func SetMerchantMaxLoanLimit(merchat models.Merchants) {
	// Connect to the Ethereum network
	client, err := ethclient.Dial(infuraURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// Parse the contract address
	contractAddr := common.HexToAddress(contractAddressHex)
	merchantAddr := common.HexToAddress(merchat.Address)

	// Load private key
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		log.Fatalf("Failed to load private key: %v", err)
	}

	// Derive public key and address
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatalf("Error casting public key to ECDSA")
	}
	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Get the nonce for the transaction
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatalf("Failed to get nonce: %v", err)
	}

	// Pack the arguments for the `setMerchantMaxLoanLimit` function
	contractAbi, err := abi.JSON(strings.NewReader(`[PASTE ABI JSON HERE]`))
	if err != nil {
		log.Fatalf("Failed to parse ABI: %v", err)
	}

	maxLimitBigInt := big.NewInt(int64(merchat.Limit))
	data, err := contractAbi.Pack("setMerchantMaxLoanLimit", merchantAddr, maxLimitBigInt)
	if err != nil {
		log.Fatalf("Failed to pack arguments: %v", err)
	}

	// Set the gas price and limit
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("Failed to suggest gas price: %v", err)
	}

	gasLimit := uint64(300000) // Set a sufficient gas limit

	// Create the transaction
	tx := types.NewTransaction(nonce, contractAddr, big.NewInt(0), gasLimit, gasPrice, data)

	// Sign the transaction
	chainID, err := client.NetworkID(context.Background())
	if err != nil {
		log.Fatalf("Failed to get chain ID: %v", err)
	}
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		log.Fatalf("Failed to sign transaction: %v", err)
	}

	// Send the transaction
	err = client.SendTransaction(context.Background(), signedTx)
	if err != nil {
		log.Fatalf("Failed to send transaction: %v", err)
	}

	fmt.Printf("Transaction sent: %s\n", signedTx.Hash().Hex())
}
