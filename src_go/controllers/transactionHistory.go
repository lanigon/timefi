package controllers

import (
	"context"
	"fmt"
	"math/big"
	"net/http"
	"strings"

	"github.com/Guesstrain/EthBankok/models"
	"github.com/gin-gonic/gin"
	"github.com/onflow/go-ethereum"
	"github.com/onflow/go-ethereum/accounts/abi"
	"github.com/onflow/go-ethereum/common"
	"github.com/onflow/go-ethereum/ethclient"
)

const (
	infuraURL          = "https://sepolia.infura.io/v3/d68e6d7c2e5c42fbb30fe563ada8f432"
	contractAddressHex = "0x7fc21ceb0C5003576ab5e101eB240c2b822c95d2"
	contractABI        = `[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]`
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

	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
		Topics: [][]common.Hash{
			{parsedABI.Events["Transfer"].ID},
			{common.BytesToHash(targetAddress.Bytes())}, // Filter for transactions to/from the target address
		},
	}

	logs, err := client.FilterLogs(context.Background(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to filter logs"})
		return
	}
	for _, vLog := range logs {
		event, err := parsedABI.Unpack("Transfer", vLog.Data)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unpack event data"})
			return
		}

		from := vLog.Topics[1].Hex()
		to := vLog.Topics[2].Hex()
		value := event[0].(*big.Int)
		TransactionList = append(TransactionList, models.Transaction{from, to, value})

		fmt.Printf("Transfer from: %s, to: %s, value: %s\n", from, to, value.String())
	}
	c.JSON(http.StatusOK, TransactionList)
}
