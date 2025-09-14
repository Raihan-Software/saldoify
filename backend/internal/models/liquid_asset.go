package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/raihan-software/saldoify/db"
	"github.com/shopspring/decimal"
)

// LiquidAsset represents a liquid asset in the system
type LiquidAsset struct {
	ID           string          `json:"id" db:"id"`
	UserID       string          `json:"user_id" db:"user_id"`
	AssetType    string          `json:"asset_type" db:"asset_type"`
	Name         string          `json:"name" db:"name"`
	Description  *string         `json:"description,omitempty" db:"description"`
	CurrentValue decimal.Decimal `json:"current_value" db:"current_value"`
	CreatedAt    time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at" db:"updated_at"`
}

// CreateLiquidAssetRequest represents the request payload for creating a liquid asset
type CreateLiquidAssetRequest struct {
	AssetType    string          `json:"asset_type" validate:"required,oneof=cash savings checking investment crypto"`
	Name         string          `json:"name" validate:"required,min=1,max=255"`
	Description  *string         `json:"description,omitempty" validate:"omitempty,max=1000"`
	CurrentValue decimal.Decimal `json:"current_value" validate:"required,gte=0"`
}

// UpdateLiquidAssetRequest represents the request payload for updating a liquid asset
type UpdateLiquidAssetRequest struct {
	AssetType    *string          `json:"asset_type,omitempty" validate:"omitempty,oneof=cash savings checking investment crypto"`
	Name         *string          `json:"name,omitempty" validate:"omitempty,min=1,max=255"`
	Description  *string          `json:"description,omitempty" validate:"omitempty,max=1000"`
	CurrentValue *decimal.Decimal `json:"current_value,omitempty" validate:"omitempty,gte=0"`
}

// LiquidAssetResponse represents the response payload for liquid asset data
type LiquidAssetResponse struct {
	ID           string          `json:"id"`
	UserID       string          `json:"user_id"`
	AssetType    string          `json:"asset_type"`
	Name         string          `json:"name"`
	Description  *string         `json:"description,omitempty"`
	CurrentValue decimal.Decimal `json:"current_value"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

// LiquidAssetsListResponse represents the response payload for listing liquid assets
type LiquidAssetsListResponse struct {
	Assets     []*LiquidAssetResponse `json:"assets"`
	Total      int                    `json:"total"`
	TotalValue decimal.Decimal        `json:"total_value"`
	Limit      int                    `json:"limit"`
	Offset     int                    `json:"offset"`
}

// ToResponse converts a LiquidAsset to LiquidAssetResponse
func (la *LiquidAsset) ToResponse() LiquidAssetResponse {
	return LiquidAssetResponse{
		ID:           la.ID,
		UserID:       la.UserID,
		AssetType:    la.AssetType,
		Name:         la.Name,
		Description:  la.Description,
		CurrentValue: la.CurrentValue,
		CreatedAt:    la.CreatedAt,
		UpdatedAt:    la.UpdatedAt,
	}
}

// NewLiquidAsset creates a new LiquidAsset instance with generated ID and timestamps
func NewLiquidAsset(userID, assetType, name string, description *string, currentValue decimal.Decimal) *LiquidAsset {
	now := time.Now()
	return &LiquidAsset{
		ID:           uuid.New().String(),
		UserID:       userID,
		AssetType:    assetType,
		Name:         name,
		Description:  description,
		CurrentValue: currentValue,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}

// ConvertFromDB converts a db.LiquidAsset to models.LiquidAsset
func ConvertFromDB(dbAsset *db.LiquidAsset) *LiquidAsset {
	var currentValue decimal.Decimal
	if dbAsset.CurrentValue.Valid {
		// Convert pgtype.Numeric to decimal.Decimal
		if dbAsset.CurrentValue.Int != nil {
			currentValue = decimal.NewFromBigInt(dbAsset.CurrentValue.Int, dbAsset.CurrentValue.Exp)
		} else {
			currentValue = decimal.Zero
		}
	} else {
		currentValue = decimal.Zero
	}

	var createdAt, updatedAt time.Time
	if dbAsset.CreatedAt.Valid {
		createdAt = dbAsset.CreatedAt.Time
	}
	if dbAsset.UpdatedAt.Valid {
		updatedAt = dbAsset.UpdatedAt.Time
	}

	return &LiquidAsset{
		ID:           dbAsset.ID,
		UserID:       dbAsset.UserID,
		AssetType:    dbAsset.AssetType,
		Name:         dbAsset.Name,
		Description:  dbAsset.Description,
		CurrentValue: currentValue,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}
}

// ConvertToDB converts a models.LiquidAsset to db.CreateLiquidAssetParams
func (la *LiquidAsset) ConvertToCreateParams() *db.CreateLiquidAssetParams {
	return &db.CreateLiquidAssetParams{
		ID:           la.ID,
		UserID:       la.UserID,
		AssetType:    la.AssetType,
		Name:         la.Name,
		Description:  la.Description,
		CurrentValue: pgtype.Numeric{Int: la.CurrentValue.BigInt(), Exp: 0, Valid: true},
		CreatedAt:    pgtype.Timestamptz{Time: la.CreatedAt, Valid: true},
		UpdatedAt:    pgtype.Timestamptz{Time: la.UpdatedAt, Valid: true},
	}
}

// ConvertToUpdateParams converts a models.LiquidAsset to db.UpdateLiquidAssetParams
func (la *LiquidAsset) ConvertToUpdateParams() *db.UpdateLiquidAssetParams {
	return &db.UpdateLiquidAssetParams{
		ID:           la.ID,
		AssetType:    la.AssetType,
		Name:         la.Name,
		Description:  la.Description,
		CurrentValue: pgtype.Numeric{Int: la.CurrentValue.BigInt(), Exp: 0, Valid: true},
		UpdatedAt:    pgtype.Timestamptz{Time: la.UpdatedAt, Valid: true},
	}
}
