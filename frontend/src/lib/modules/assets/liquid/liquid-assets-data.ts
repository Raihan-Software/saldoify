export interface LiquidAsset {
	id: string;
	name: string;
	type: 'cash' | 'savings' | 'checking' | 'money-market' | 'other';
	institution?: string;
	accountNumber?: string;
	balance: number;
	currency: string;
	lastUpdated: Date;
	notes?: string;
}

export const liquidAssetTypes = {
	cash: { label: 'Cash', icon: '💵' },
	savings: { label: 'Savings Account', icon: '🏦' },
	checking: { label: 'Checking Account', icon: '💳' },
	'money-market': { label: 'Money Market', icon: '📈' },
	other: { label: 'Other', icon: '📊' }
};

export const mockLiquidAssets: LiquidAsset[] = [
	{
		id: '1',
		name: 'Cash on Hand',
		type: 'cash',
		balance: 500000,
		currency: 'IDR',
		lastUpdated: new Date('2024-01-15'),
		notes: 'Emergency cash'
	},
	{
		id: '2',
		name: 'BCA Savings',
		type: 'savings',
		institution: 'Bank Central Asia',
		accountNumber: '****1234',
		balance: 45000000,
		currency: 'IDR',
		lastUpdated: new Date('2024-01-20')
	},
	{
		id: '3',
		name: 'Mandiri Checking',
		type: 'checking',
		institution: 'Bank Mandiri',
		accountNumber: '****5678',
		balance: 15000000,
		currency: 'IDR',
		lastUpdated: new Date('2024-01-20')
	},
	{
		id: '4',
		name: 'BNI Savings',
		type: 'savings',
		institution: 'Bank Negara Indonesia',
		accountNumber: '****9012',
		balance: 25000000,
		currency: 'IDR',
		lastUpdated: new Date('2024-01-19')
	},
	{
		id: '5',
		name: 'Jenius Digital Savings',
		type: 'savings',
		institution: 'BTPN Jenius',
		accountNumber: '****3456',
		balance: 8000000,
		currency: 'IDR',
		lastUpdated: new Date('2024-01-20'),
		notes: 'Online shopping fund'
	},
];

export function calculateTotalLiquidAssets(assets: LiquidAsset[]): number {
	return assets.reduce((total, asset) => total + asset.balance, 0);
}

export function groupAssetsByType(assets: LiquidAsset[]): Record<string, LiquidAsset[]> {
	return assets.reduce((groups, asset) => {
		const type = asset.type;
		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push(asset);
		return groups;
	}, {} as Record<string, LiquidAsset[]>);
}