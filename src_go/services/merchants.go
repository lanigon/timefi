package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/Guesstrain/EthBankok/config"
	"github.com/Guesstrain/EthBankok/models"
)

type MerchantService interface {
	AddMerchant(merchant *models.Merchants) error
	GetMerchantByID(id uint) (models.Merchants, error)
	GetAllMerchants() ([]models.Merchants, error)
}

type MerchantServiceImpl struct{}

func (m *MerchantServiceImpl) AddMerchant(merchant *models.Merchants) error {
	return config.CreateMerchant(merchant)
}

// GetMerchantByID retrieves a merchant by ID
func (m *MerchantServiceImpl) GetMerchantByID(id uint) (models.Merchants, error) {
	return config.GetMerchantByID(id)
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
