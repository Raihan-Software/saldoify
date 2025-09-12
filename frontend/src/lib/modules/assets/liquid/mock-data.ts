import type { LiquidAsset, AssetTypeInfo } from '../types';

export const assetTypes: AssetTypeInfo[] = [
	{ value: 'cash', label: 'Cash', icon: 'wallet' },
	{ value: 'savings', label: 'Savings Account', icon: 'piggy-bank' },
	{ value: 'checking', label: 'Checking Account', icon: 'credit-card' },
	{ value: 'investment', label: 'Investment Account', icon: 'trending-up' },
	{ value: 'crypto', label: 'Cryptocurrency', icon: 'bitcoin' },
	{ value: 'other', label: 'Other', icon: 'coins' }
];

export const mockLiquidAssets: LiquidAsset[] = [
	{
		id: '1',
		title: 'Dana Darurat',
		type: 'savings',
		startingBalance: 60000000,
		currentBalance: 62500000,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-12-01')
	},
	{
		id: '2',
		title: 'Rekening Utama',
		type: 'checking',
		startingBalance: 30000000,
		currentBalance: 31500000,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-12-15')
	},
	{
		id: '3',
		title: 'Portofolio Investasi',
		type: 'investment',
		startingBalance: 120000000,
		currentBalance: 125000000,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-12-20')
	},
	{
		id: '4',
		title: 'Dompet Kripto',
		type: 'crypto',
		startingBalance: 15000000,
		currentBalance: 18500000,
		createdAt: new Date('2024-03-01'),
		updatedAt: new Date('2024-12-22')
	},
	{
		id: '5',
		title: 'Uang Tunai',
		type: 'cash',
		startingBalance: 5000000,
		currentBalance: 4500000,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-12-20')
	}
];