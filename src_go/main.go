package main

import (
	"fmt"
	"sync"
	"time"

	"github.com/Guesstrain/EthBankok/config"
	"github.com/Guesstrain/EthBankok/controllers"
	"github.com/Guesstrain/EthBankok/models"
	"github.com/Guesstrain/EthBankok/services"
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()
	merchantService := services.NewMerchantService()

	router := gin.New()
	router.Use(gin.Recovery(), gin.Logger())

	// Define routes for merchants
	router.POST("/merchants", func(c *gin.Context) {
		controllers.AddMerchantHandler(c, merchantService)
	})
	router.GET("/merchants/:id", func(c *gin.Context) {
		controllers.GetMerchantByIDHandler(c, merchantService)
	})
	router.GET("/merchants", func(c *gin.Context) {
		controllers.GetAllMerchantsHandler(c, merchantService)
	})
	router.GET("/transactions", func(c *gin.Context) {
		controllers.GetTransactionHistory(c)
	})

	go scheduleCreditUpdate(merchantService)

	router.Run(":8080")
}

func scheduleCreditUpdate(merchantService services.MerchantService) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for {
		<-ticker.C
		err := updateAllMerchantsCredit(merchantService)
		if err != nil {
			fmt.Println("Error updating merchant credits:", err)
		} else {
			fmt.Println("Successfully updated merchant credits.")
		}
	}
}

func updateAllMerchantsCredit(merchantService services.MerchantService) error {
	var wg sync.WaitGroup
	merchants, err := merchantService.GetAllMerchants() // Assumes a GetAllMerchants method
	if err != nil {
		return err
	}

	// Channel to collect updated merchants from goroutines
	updatedMerchantsCh := make(chan models.Merchants)
	// Channel to collect errors
	errorsCh := make(chan error)

	// Start goroutines to update each merchant
	for _, merchant := range merchants {
		wg.Add(1)
		go func(m models.Merchants) {
			defer wg.Done()
			// updatedMerchant, err := services.GetCredit(m)
			updatedMerchant := merchant
			updatedMerchant.Credit = 233
			if err != nil {
				errorsCh <- err // Send error to channel
			} else {
				updatedMerchantsCh <- updatedMerchant // Send updated merchant to channel
				fmt.Printf("Updated credit for merchant %s: %v\n", updatedMerchant.Name, updatedMerchant.Credit)
			}
		}(merchant)
	}

	// Close channels when all goroutines have finished
	go func() {
		wg.Wait()
		close(updatedMerchantsCh)
		close(errorsCh)
	}()

	// Collect updated merchants and errors
	var updatedMerchants []models.Merchants
	for updatedMerchant := range updatedMerchantsCh {
		updatedMerchants = append(updatedMerchants, updatedMerchant)
	}

	var errorList []error
	for err := range errorsCh {
		errorList = append(errorList, err)
	}

	// Update all merchants in the database
	if len(errorList) > 0 {
		return fmt.Errorf("errors occurred while updating merchants: %v", errorList)
	}

	err = config.UpdateMerchants(updatedMerchants)
	if err != nil {
		return err
	}

	return nil
}
