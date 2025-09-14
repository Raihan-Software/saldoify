package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/raihan-software/saldoify/db"
	"github.com/raihan-software/saldoify/internal/database"
	"github.com/raihan-software/saldoify/internal/models"
	"github.com/shopspring/decimal"
)

// LiquidAssetRepository interface defines the contract for liquid asset data operations
type LiquidAssetRepository interface {
	Create(asset *models.LiquidAsset) error
	GetByID(id string) (*models.LiquidAsset, error)
	GetByUserID(userID string) ([]*models.LiquidAsset, error)
	GetByUserIDAndType(userID, assetType string) ([]*models.LiquidAsset, error)
	Update(asset *models.LiquidAsset) error
	Delete(id string) error
	List(userID string, limit, offset int) ([]*models.LiquidAsset, error)
	Count(userID string) (int, error)
	GetTotalValue(userID string) (decimal.Decimal, error)
}

// liquidAssetRepository implements LiquidAssetRepository interface
type liquidAssetRepository struct {
	queries *db.Queries
}

// NewLiquidAssetRepository creates a new liquid asset repository instance
func NewLiquidAssetRepository() LiquidAssetRepository {
	return &liquidAssetRepository{
		queries: database.Queries,
	}
}

// Create inserts a new liquid asset into the database
func (r *liquidAssetRepository) Create(asset *models.LiquidAsset) error {
	ctx := context.Background()

	params := asset.ConvertToCreateParams()

	_, err := r.queries.CreateLiquidAsset(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to create liquid asset: %w", err)
	}

	return nil
}

// GetByID retrieves a liquid asset by ID
func (r *liquidAssetRepository) GetByID(id string) (*models.LiquidAsset, error) {
	ctx := context.Background()

	dbAsset, err := r.queries.GetLiquidAssetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get liquid asset by ID: %w", err)
	}

	return models.ConvertFromDB(dbAsset), nil
}

// GetByUserID retrieves all liquid assets for a user
func (r *liquidAssetRepository) GetByUserID(userID string) ([]*models.LiquidAsset, error) {
	ctx := context.Background()

	dbAssets, err := r.queries.GetLiquidAssetsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get liquid assets by user ID: %w", err)
	}

	assets := make([]*models.LiquidAsset, len(dbAssets))
	for i, dbAsset := range dbAssets {
		assets[i] = models.ConvertFromDB(dbAsset)
	}

	return assets, nil
}

// GetByUserIDAndType retrieves liquid assets for a user filtered by type
func (r *liquidAssetRepository) GetByUserIDAndType(userID, assetType string) ([]*models.LiquidAsset, error) {
	ctx := context.Background()

	params := &db.GetLiquidAssetsByUserIDAndTypeParams{
		UserID:    userID,
		AssetType: assetType,
	}

	dbAssets, err := r.queries.GetLiquidAssetsByUserIDAndType(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to get liquid assets by user ID and type: %w", err)
	}

	assets := make([]*models.LiquidAsset, len(dbAssets))
	for i, dbAsset := range dbAssets {
		assets[i] = models.ConvertFromDB(dbAsset)
	}

	return assets, nil
}

// Update updates an existing liquid asset
func (r *liquidAssetRepository) Update(asset *models.LiquidAsset) error {
	ctx := context.Background()

	asset.UpdatedAt = time.Now()
	params := asset.ConvertToUpdateParams()

	_, err := r.queries.UpdateLiquidAsset(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to update liquid asset: %w", err)
	}

	return nil
}

// Delete removes a liquid asset by ID
func (r *liquidAssetRepository) Delete(id string) error {
	ctx := context.Background()

	err := r.queries.DeleteLiquidAsset(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete liquid asset: %w", err)
	}

	return nil
}

// List retrieves a paginated list of liquid assets for a user
func (r *liquidAssetRepository) List(userID string, limit, offset int) ([]*models.LiquidAsset, error) {
	ctx := context.Background()

	params := &db.ListLiquidAssetsParams{
		UserID: userID,
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	dbAssets, err := r.queries.ListLiquidAssets(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to list liquid assets: %w", err)
	}

	assets := make([]*models.LiquidAsset, len(dbAssets))
	for i, dbAsset := range dbAssets {
		assets[i] = models.ConvertFromDB(dbAsset)
	}

	return assets, nil
}

// Count returns the total number of liquid assets for a user
func (r *liquidAssetRepository) Count(userID string) (int, error) {
	ctx := context.Background()

	count, err := r.queries.CountLiquidAssets(ctx, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to count liquid assets: %w", err)
	}

	return int(count), nil
}

// GetTotalValue returns the total value of all liquid assets for a user
func (r *liquidAssetRepository) GetTotalValue(userID string) (decimal.Decimal, error) {
	ctx := context.Background()

	totalValue, err := r.queries.GetLiquidAssetsTotalValue(ctx, userID)
	if err != nil {
		return decimal.Zero, fmt.Errorf("failed to get total value: %w", err)
	}

	// Convert the interface{} to decimal.Decimal
	if totalValue == nil {
		return decimal.Zero, nil
	}

	// Handle different possible types from the database
	switch v := totalValue.(type) {
	case float64:
		return decimal.NewFromFloat(v), nil
	case int64:
		return decimal.NewFromInt(v), nil
	case string:
		return decimal.NewFromString(v)
	default:
		return decimal.Zero, fmt.Errorf("unexpected type for total value: %T", totalValue)
	}
}
