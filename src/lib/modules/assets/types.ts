export type AssetType = 'cash' | 'savings' | 'checking' | 'investment' | 'crypto' | 'other';

export interface LiquidAsset {
	id: string;
	title: string;
	type: AssetType;
	startingBalance: number;
	currentBalance: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface AssetTypeInfo {
	value: AssetType;
	label: string;
	icon?: string;
}