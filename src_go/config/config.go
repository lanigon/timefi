package config

import (
	"fmt"
	"log"

	"github.com/Guesstrain/EthBankok/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	//dsn := "root:password@tcp(mysqlc:3306)/Eth_Bankok?charset=utf8mb4&parseTime=True&loc=Local"
	dsn := "root:password@tcp(127.0.0.1:3306)/Eth_Bankok?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	DB = database
	fmt.Println("Database connection successful!")
}

// CreateMerchant adds a new merchant to the database
func CreateMerchant(merchant *models.Merchants) error {
	return DB.Create(merchant).Error
}

func GetMerchantByID(id uint) (models.Merchants, error) {
	var merchant models.Merchants
	if err := DB.First(&merchant, id).Error; err != nil {
		return merchant, err
	}
	return merchant, nil
}

func GetMerchantByAddress(address string) (models.Merchants, error) {
	var merchant models.Merchants
	if err := DB.Where("address = ?", address).First(&merchant).Error; err != nil {
		return merchant, err
	}
	return merchant, nil
}

func GetAllMerchants() ([]models.Merchants, error) {
	var merchants []models.Merchants
	if err := DB.Find(&merchants).Error; err != nil {
		return nil, err
	}
	return merchants, nil
}

func UpdateMerchants(merchants []models.Merchants) error {
	tx := DB.Begin()

	for _, merchant := range merchants {
		if err := tx.Model(&models.Merchants{}).
			Where("id = ?", merchant.ID).
			Updates(merchant).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}
