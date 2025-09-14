-- name: CreateLiquidAsset :one
INSERT INTO liquid_assets (id, user_id, asset_type, name, description, current_value, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetLiquidAssetByID :one
SELECT * FROM liquid_assets WHERE id = $1;

-- name: GetLiquidAssetsByUserID :many
SELECT * FROM liquid_assets 
WHERE user_id = $1 
ORDER BY created_at DESC;

-- name: GetLiquidAssetsByUserIDAndType :many
SELECT * FROM liquid_assets 
WHERE user_id = $1 AND asset_type = $2 
ORDER BY created_at DESC;

-- name: UpdateLiquidAsset :one
UPDATE liquid_assets 
SET asset_type = $2, name = $3, description = $4, current_value = $5, updated_at = $6
WHERE id = $1
RETURNING *;

-- name: DeleteLiquidAsset :exec
DELETE FROM liquid_assets WHERE id = $1;

-- name: ListLiquidAssets :many
SELECT * FROM liquid_assets 
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountLiquidAssets :one
SELECT COUNT(*) FROM liquid_assets WHERE user_id = $1;

-- name: GetLiquidAssetsTotalValue :one
SELECT COALESCE(SUM(current_value), 0) as total_value 
FROM liquid_assets 
WHERE user_id = $1;
