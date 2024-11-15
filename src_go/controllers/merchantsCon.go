package controllers

import (
	"net/http"
	"strconv"

	"github.com/Guesstrain/EthBankok/models"
	"github.com/Guesstrain/EthBankok/services"
	"github.com/gin-gonic/gin"
)

// Handler for adding a merchant
func AddMerchantHandler(c *gin.Context, service services.MerchantService) {
	var newMerchant *models.Merchants
	if err := c.ShouldBindJSON(&newMerchant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newMerchant.Credit = 11.11
	if err := service.AddMerchant(newMerchant); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add merchant"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Merchant added successfully"})
}

// Handler for getting a merchant by ID
func GetMerchantByIDHandler(c *gin.Context, service services.MerchantService) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	merchant, err := service.GetMerchantByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Merchant not found"})
		return
	}
	c.JSON(http.StatusOK, merchant)
}

// Handler for getting all merchants
func GetAllMerchantsHandler(c *gin.Context, service services.MerchantService) {
	merchants, err := service.GetAllMerchants()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve merchants"})
		return
	}
	c.JSON(http.StatusOK, merchants)
}
