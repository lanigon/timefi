package models

import (
	"math/big"
	"time"
)

type Merchants struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name" binding:"required"`
	Email     string    `json:"email" binding:"required,email"`
	Address   string    `json:"address"`
	IDNumber  string    `json:"id_number" binding:"required"`
	Credit    float64   `json:"credit" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at"`
}

type Transaction struct {
	From  string   `json:"from"`
	To    string   `json:"to"`
	Value *big.Int `json:"value"`
}
