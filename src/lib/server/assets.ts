import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generate an asset ID
function generateAssetId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Get all assets for a user by type
export async function getUserAssetsByType(userId: string, type: 'liquid' | 'non_liquid' | 'investment') {
	const assets = await db
		.select({
			asset: table.assets,
			assetType: table.assetTypes
		})
		.from(table.assets)
		.leftJoin(table.assetTypes, eq(table.assets.assetTypeId, table.assetTypes.id))
		.where(
			and(
				eq(table.assets.userId, userId),
				eq(table.assets.type, type)
			)
		)
		.orderBy(desc(table.assets.currentValue));
	
	return assets.map(row => ({
		...row.asset,
		assetType: row.assetType
	}));
}

// Get all assets for a user
export async function getUserAssets(userId: string) {
	const assets = await db
		.select({
			asset: table.assets,
			assetType: table.assetTypes
		})
		.from(table.assets)
		.leftJoin(table.assetTypes, eq(table.assets.assetTypeId, table.assetTypes.id))
		.where(eq(table.assets.userId, userId))
		.orderBy(desc(table.assets.currentValue));
	
	return assets.map(row => ({
		...row.asset,
		assetType: row.assetType
	}));
}

// Get a single asset
export async function getAsset(userId: string, assetId: string) {
	const [asset] = await db
		.select({
			asset: table.assets,
			assetType: table.assetTypes
		})
		.from(table.assets)
		.leftJoin(table.assetTypes, eq(table.assets.assetTypeId, table.assetTypes.id))
		.where(
			and(
				eq(table.assets.id, assetId),
				eq(table.assets.userId, userId)
			)
		)
		.limit(1);
	
	if (!asset) return null;
	
	return {
		...asset.asset,
		assetType: asset.assetType
	};
}

// Create a new asset
export async function createAsset(userId: string, data: {
	type: 'liquid' | 'non_liquid' | 'investment';
	assetTypeId: string;
	name: string;
	description?: string;
	currentValue: string;
	purchaseValue?: string;
	purchaseDate?: Date;
	accountNumber?: string;
	bankName?: string;
	location?: string;
	quantity?: number;
	ticker?: string;
	shares?: string;
	notes?: string;
}) {
	const assetId = generateAssetId();
	
	const [asset] = await db
		.insert(table.assets)
		.values({
			id: assetId,
			userId,
			...data
		})
		.returning();
	
	return asset;
}

// Update an asset
export async function updateAsset(
	userId: string,
	assetId: string,
	data: Partial<{
		name: string;
		description: string;
		currentValue: string;
		purchaseValue: string;
		purchaseDate: Date;
		accountNumber: string;
		bankName: string;
		location: string;
		quantity: number;
		ticker: string;
		shares: string;
		notes: string;
	}>
) {
	const updates: Partial<table.Asset> = {
		...data,
		updatedAt: new Date()
	};
	
	const [updated] = await db
		.update(table.assets)
		.set(updates)
		.where(
			and(
				eq(table.assets.id, assetId),
				eq(table.assets.userId, userId)
			)
		)
		.returning();
	
	return updated;
}

// Delete an asset
export async function deleteAsset(userId: string, assetId: string) {
	const [deleted] = await db
		.delete(table.assets)
		.where(
			and(
				eq(table.assets.id, assetId),
				eq(table.assets.userId, userId)
			)
		)
		.returning();
	
	return deleted;
}

// Get asset summary by type
export async function getAssetSummaryByType(userId: string, type: 'liquid' | 'non_liquid' | 'investment') {
	const assets = await getUserAssetsByType(userId, type);
	
	const totalValue = assets.reduce((sum, asset) => {
		return sum + (parseFloat(asset.currentValue) || 0);
	}, 0);
	
	const totalPurchaseValue = assets.reduce((sum, asset) => {
		return sum + (parseFloat(asset.purchaseValue || '0') || 0);
	}, 0);
	
	const growth = totalPurchaseValue > 0 
		? ((totalValue - totalPurchaseValue) / totalPurchaseValue) * 100 
		: 0;
	
	return {
		count: assets.length,
		totalValue,
		totalPurchaseValue,
		growth
	};
}