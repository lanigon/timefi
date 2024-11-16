package models

import (
	"math/big"
	"time"

	"github.com/onflow/go-ethereum/common"
)

type Merchants struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name" binding:"required"`
	Email     string    `json:"email" binding:"required,email"`
	Address   string    `json:"address"`
	IDNumber  string    `json:"id_number" binding:"required"`
	Credit    float64   `json:"credit" gorm:"default:0"`
	Limit     float64   `json:"limit"`
	CreatedAt time.Time `json:"created_at"`
}

type Transaction struct {
	From  string   `json:"from"`
	To    string   `json:"to"`
	Value *big.Int `json:"value"`
}

type Loan struct {
	LoanID       *big.Int       `json:"loanId"`
	Buyer        common.Address `json:"buyer"`
	Merchant     common.Address `json:"merchant"`
	Amount       *big.Int       `json:"amount"`
	DueDate      *big.Int       `json:"dueDate"`
	RepaidAmount *big.Int       `json:"repaidAmount"`
	IsRepaid     bool           `json:"isRepaid"`
}
