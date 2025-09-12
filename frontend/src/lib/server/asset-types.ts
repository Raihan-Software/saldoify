import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generate an asset type ID
function generateAssetTypeId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Default asset types
export const defaultAssetTypes = {
	liquid: [
		{ label: 'Cash', icon: '💵' },
		{ label: 'Checking Account', icon: '🏦' },
		{ label: 'Savings Account', icon: '💰' },
		{ label: 'Money Market', icon: '📈' },
		{ label: 'Cash App', icon: '📱' },
		{ label: 'PayPal', icon: '💳' }
	],
	non_liquid: [
		{ label: 'Real Estate', icon: '🏠' },
		{ label: 'Vehicle', icon: '🚗' },
		{ label: 'Jewelry', icon: '💎' },
		{ label: 'Electronics', icon: '💻' },
		{ label: 'Collectibles', icon: '🎨' },
		{ label: 'Business Equipment', icon: '🏢' }
	],
	investment: [
		{ label: 'Stocks', icon: '📊' },
		{ label: 'Bonds', icon: '📜' },
		{ label: 'Mutual Funds', icon: '🏛️' },
		{ label: 'ETFs', icon: '📈' },
		{ label: 'Cryptocurrency', icon: '₿' },
		{ label: 'Retirement Account', icon: '🏖️' },
		{ label: 'Commodities', icon: '🛢️' }
	]
};

// Create default asset types for a new user
export async function createDefaultAssetTypes(userId: string) {
	const assetTypesToCreate: any[] = [];
	
	for (const [category, types] of Object.entries(defaultAssetTypes)) {
		for (const type of types) {
			assetTypesToCreate.push({
				id: generateAssetTypeId(),
				userId,
				category,
				label: type.label,
				icon: type.icon,
				isSystem: true
			});
		}
	}
	
	try {
		await db.insert(table.assetTypes).values(assetTypesToCreate);
	} catch (error) {
		console.error('Failed to create default asset types:', error);
	}
}

// Get all asset types for a user
export async function getUserAssetTypes(userId: string) {
	const assetTypes = await db
		.select()
		.from(table.assetTypes)
		.where(eq(table.assetTypes.userId, userId))
		.orderBy(table.assetTypes.category, table.assetTypes.createdAt);
	
	// Group by category
	const grouped = {
		liquid: assetTypes.filter(at => at.category === 'liquid'),
		non_liquid: assetTypes.filter(at => at.category === 'non_liquid'),
		investment: assetTypes.filter(at => at.category === 'investment')
	};
	
	return grouped;
}

// Create a new asset type
export async function createAssetType(userId: string, data: { category: string; label: string; icon: string }) {
	const assetTypeId = generateAssetTypeId();
	
	const [assetType] = await db
		.insert(table.assetTypes)
		.values({
			id: assetTypeId,
			userId,
			category: data.category,
			label: data.label,
			icon: data.icon,
			isSystem: false
		})
		.returning();
	
	return assetType;
}

// Update an asset type
export async function updateAssetType(
	userId: string,
	assetTypeId: string,
	data: { label?: string; icon?: string }
) {
	const updates: Partial<table.AssetType> = {
		...data,
		updatedAt: new Date()
	};
	
	const [updated] = await db
		.update(table.assetTypes)
		.set(updates)
		.where(
			and(
				eq(table.assetTypes.id, assetTypeId),
				eq(table.assetTypes.userId, userId)
			)
		)
		.returning();
	
	return updated;
}

// Delete an asset type
export async function deleteAssetType(userId: string, assetTypeId: string) {
	const [deleted] = await db
		.delete(table.assetTypes)
		.where(
			and(
				eq(table.assetTypes.id, assetTypeId),
				eq(table.assetTypes.userId, userId),
				eq(table.assetTypes.isSystem, false) // Can't delete system types
			)
		)
		.returning();
	
	return deleted;
}