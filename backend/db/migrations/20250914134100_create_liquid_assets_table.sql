-- migrate:up
CREATE TABLE liquid_assets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_liquid_assets_user_id ON liquid_assets(user_id);
CREATE INDEX idx_liquid_assets_asset_type ON liquid_assets(asset_type);

-- migrate:down
DROP TABLE liquid_assets;