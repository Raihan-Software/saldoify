export interface NonLiquidAsset {
	id: string;
	name: string;
	type: 'property' | 'vehicle' | 'electronics' | 'equipment' | 'jewelry' | 'collectibles' | 'other';
	category?: string;
	purchasePrice: number;
	currentValue: number;
	purchaseDate: Date;
	currency: string;
	location?: string;
	condition?: 'excellent' | 'good' | 'fair' | 'poor';
	notes?: string;
	depreciationRate?: number; // Annual depreciation percentage
}

export const nonLiquidAssetTypes = {
	property: { label: 'Property', icon: '🏠' },
	vehicle: { label: 'Vehicle', icon: '🚗' },
	electronics: { label: 'Electronics', icon: '💻' },
	equipment: { label: 'Equipment', icon: '🔧' },
	jewelry: { label: 'Jewelry', icon: '💎' },
	collectibles: { label: 'Collectibles', icon: '🎨' },
	other: { label: 'Other', icon: '📦' }
};

export const mockNonLiquidAssets: NonLiquidAsset[] = [
	{
		id: '1',
		name: 'Jakarta Apartment',
		type: 'property',
		category: 'Residential',
		purchasePrice: 850000000,
		currentValue: 950000000,
		purchaseDate: new Date('2021-06-15'),
		currency: 'IDR',
		location: 'South Jakarta',
		condition: 'excellent',
		notes: '2BR unit in CBD area'
	},
	{
		id: '2',
		name: 'Toyota Innova 2022',
		type: 'vehicle',
		category: 'Car',
		purchasePrice: 380000000,
		currentValue: 340000000,
		purchaseDate: new Date('2022-03-20'),
		currency: 'IDR',
		condition: 'excellent',
		notes: 'Family car, full service history',
		depreciationRate: 10
	},
	{
		id: '3',
		name: 'MacBook Pro M2',
		type: 'electronics',
		category: 'Computer',
		purchasePrice: 28000000,
		currentValue: 24000000,
		purchaseDate: new Date('2023-01-10'),
		currency: 'IDR',
		condition: 'excellent',
		notes: 'Work laptop',
		depreciationRate: 15
	},
	{
		id: '4',
		name: 'Honda PCX 160',
		type: 'vehicle',
		category: 'Motorcycle',
		purchasePrice: 35000000,
		currentValue: 30000000,
		purchaseDate: new Date('2023-05-15'),
		currency: 'IDR',
		condition: 'good',
		notes: 'Daily commute',
		depreciationRate: 12
	},
	{
		id: '5',
		name: 'iPhone 14 Pro',
		type: 'electronics',
		category: 'Phone',
		purchasePrice: 22000000,
		currentValue: 18000000,
		purchaseDate: new Date('2023-09-20'),
		currency: 'IDR',
		condition: 'excellent',
		depreciationRate: 20
	},
	{
		id: '6',
		name: 'Gold Necklace',
		type: 'jewelry',
		category: '24K Gold',
		purchasePrice: 15000000,
		currentValue: 17000000,
		purchaseDate: new Date('2020-12-25'),
		currency: 'IDR',
		condition: 'excellent',
		notes: 'Wedding gift, 20 grams'
	},
	{
		id: '7',
		name: 'Sony A7 III Camera',
		type: 'equipment',
		category: 'Photography',
		purchasePrice: 25000000,
		currentValue: 20000000,
		purchaseDate: new Date('2022-07-10'),
		currency: 'IDR',
		condition: 'good',
		notes: 'With 24-70mm lens',
		depreciationRate: 10
	},
	{
		id: '8',
		name: 'Vintage Watch Collection',
		type: 'collectibles',
		category: 'Watches',
		purchasePrice: 45000000,
		currentValue: 52000000,
		purchaseDate: new Date('2021-03-15'),
		currency: 'IDR',
		condition: 'excellent',
		notes: '3 vintage Seiko watches'
	}
];

export function calculateTotalNonLiquidAssets(assets: NonLiquidAsset[]): {
	totalPurchasePrice: number;
	totalCurrentValue: number;
	totalAppreciation: number;
	appreciationPercent: number;
} {
	const totalPurchasePrice = assets.reduce((total, asset) => total + asset.purchasePrice, 0);
	const totalCurrentValue = assets.reduce((total, asset) => total + asset.currentValue, 0);
	const totalAppreciation = totalCurrentValue - totalPurchasePrice;
	const appreciationPercent = totalPurchasePrice > 0 ? (totalAppreciation / totalPurchasePrice) * 100 : 0;
	
	return {
		totalPurchasePrice,
		totalCurrentValue,
		totalAppreciation,
		appreciationPercent
	};
}

export function groupAssetsByType(assets: NonLiquidAsset[]): Record<string, NonLiquidAsset[]> {
	return assets.reduce((groups, asset) => {
		const type = asset.type;
		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push(asset);
		return groups;
	}, {} as Record<string, NonLiquidAsset[]>);
}

export function getConditionColor(condition?: string): string {
	switch (condition) {
		case 'excellent': return 'text-green-600';
		case 'good': return 'text-blue-600';
		case 'fair': return 'text-yellow-600';
		case 'poor': return 'text-red-600';
		default: return 'text-gray-600';
	}
}