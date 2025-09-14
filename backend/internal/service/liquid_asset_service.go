package service

import (
	"errors"
	"fmt"

	"github.com/raihan-software/saldoify/internal/models"
	"github.com/raihan-software/saldoify/internal/repository"
)

// LiquidAssetService interface defines the contract for liquid asset business logic
type LiquidAssetService interface {
	CreateAsset(userID string, req *models.CreateLiquidAssetRequest) (*models.LiquidAssetResponse, error)
	GetAsset(userID, assetID string) (*models.LiquidAssetResponse, error)
	UpdateAsset(userID, assetID string, req *models.UpdateLiquidAssetRequest) (*models.LiquidAssetResponse, error)
	DeleteAsset(userID, assetID string) error
	ListAssets(userID string, limit, offset int) (*models.LiquidAssetsListResponse, error)
	GetAssetsByType(userID, assetType string) ([]*models.LiquidAssetResponse, error)
	GetTotalValue(userID string) (models.LiquidAssetResponse, error)
}

// liquidAssetService implements LiquidAssetService interface
type liquidAssetService struct {
	assetRepo repository.LiquidAssetRepository
}

// NewLiquidAssetService creates a new liquid asset service instance
func NewLiquidAssetService(assetRepo repository.LiquidAssetRepository) LiquidAssetService {
	return &liquidAssetService{
		assetRepo: assetRepo,
	}
}

// CreateAsset creates a new liquid asset
func (s *liquidAssetService) CreateAsset(userID string, req *models.CreateLiquidAssetRequest) (*models.LiquidAssetResponse, error) {
	// Create new asset
	asset := models.NewLiquidAsset(userID, req.AssetType, req.Name, req.Description, req.CurrentValue)

	// Save to database
	if err := s.assetRepo.Create(asset); err != nil {
		return nil, fmt.Errorf("failed to create liquid asset: %w", err)
	}

	response := asset.ToResponse()
	return &response, nil
}

// GetAsset retrieves a liquid asset by ID
func (s *liquidAssetService) GetAsset(userID, assetID string) (*models.LiquidAssetResponse, error) {
	asset, err := s.assetRepo.GetByID(assetID)
	if err != nil {
		return nil, fmt.Errorf("failed to get liquid asset: %w", err)
	}

	// Check if the asset belongs to the user
	if asset.UserID != userID {
		return nil, errors.New("asset not found")
	}

	response := asset.ToResponse()
	return &response, nil
}

// UpdateAsset updates an existing liquid asset
func (s *liquidAssetService) UpdateAsset(userID, assetID string, req *models.UpdateLiquidAssetRequest) (*models.LiquidAssetResponse, error) {
	// Get existing asset
	asset, err := s.assetRepo.GetByID(assetID)
	if err != nil {
		return nil, fmt.Errorf("failed to get liquid asset: %w", err)
	}

	// Check if the asset belongs to the user
	if asset.UserID != userID {
		return nil, errors.New("asset not found")
	}

	// Update fields if provided
	if req.AssetType != nil {
		asset.AssetType = *req.AssetType
	}
	if req.Name != nil {
		asset.Name = *req.Name
	}
	if req.Description != nil {
		asset.Description = req.Description
	}
	if req.CurrentValue != nil {
		asset.CurrentValue = *req.CurrentValue
	}

	// Save changes
	if err := s.assetRepo.Update(asset); err != nil {
		return nil, fmt.Errorf("failed to update liquid asset: %w", err)
	}

	response := asset.ToResponse()
	return &response, nil
}

// DeleteAsset removes a liquid asset
func (s *liquidAssetService) DeleteAsset(userID, assetID string) error {
	// Get existing asset to verify ownership
	asset, err := s.assetRepo.GetByID(assetID)
	if err != nil {
		return fmt.Errorf("failed to get liquid asset: %w", err)
	}

	// Check if the asset belongs to the user
	if asset.UserID != userID {
		return errors.New("asset not found")
	}

	return s.assetRepo.Delete(assetID)
}

// ListAssets retrieves a paginated list of liquid assets
func (s *liquidAssetService) ListAssets(userID string, limit, offset int) (*models.LiquidAssetsListResponse, error) {
	assets, err := s.assetRepo.List(userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list liquid assets: %w", err)
	}

	total, err := s.assetRepo.Count(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count liquid assets: %w", err)
	}

	totalValue, err := s.assetRepo.GetTotalValue(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get total value: %w", err)
	}

	var responses []*models.LiquidAssetResponse
	for _, asset := range assets {
		response := asset.ToResponse()
		responses = append(responses, &response)
	}

	return &models.LiquidAssetsListResponse{
		Assets:     responses,
		Total:      total,
		TotalValue: totalValue,
		Limit:      limit,
		Offset:     offset,
	}, nil
}

// GetAssetsByType retrieves liquid assets filtered by type
func (s *liquidAssetService) GetAssetsByType(userID, assetType string) ([]*models.LiquidAssetResponse, error) {
	assets, err := s.assetRepo.GetByUserIDAndType(userID, assetType)
	if err != nil {
		return nil, fmt.Errorf("failed to get liquid assets by type: %w", err)
	}

	var responses []*models.LiquidAssetResponse
	for _, asset := range assets {
		response := asset.ToResponse()
		responses = append(responses, &response)
	}

	return responses, nil
}

// GetTotalValue returns the total value of all liquid assets for a user
func (s *liquidAssetService) GetTotalValue(userID string) (models.LiquidAssetResponse, error) {
	totalValue, err := s.assetRepo.GetTotalValue(userID)
	if err != nil {
		return models.LiquidAssetResponse{}, fmt.Errorf("failed to get total value: %w", err)
	}

	// Return a special response for total value
	return models.LiquidAssetResponse{
		ID:           "total",
		UserID:       userID,
		AssetType:    "total",
		Name:         "Total Liquid Assets",
		Description:  nil,
		CurrentValue: totalValue,
	}, nil
}
