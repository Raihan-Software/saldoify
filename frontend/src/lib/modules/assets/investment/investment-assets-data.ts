export interface InvestmentAsset {
	id: string;
	name: string;
	type: 'stocks' | 'crypto' | 'mutual-funds' | 'bonds' | 'etf' | 'commodities' | 'other';
	ticker?: string;
	quantity: number;
	purchasePrice: number; // Price per unit
	currentPrice: number; // Current price per unit
	purchaseDate: Date;
	currency: string;
	notes?: string;
}

export const investmentAssetTypes = {
	stocks: { label: 'Stocks', icon: '📈' },
	crypto: { label: 'Cryptocurrency', icon: '₿' },
	'mutual-funds': { label: 'Mutual Funds', icon: '🏦' },
	bonds: { label: 'Bonds', icon: '📜' },
	etf: { label: 'ETF', icon: '💹' },
	commodities: { label: 'Commodities', icon: '🏅' },
	other: { label: 'Other', icon: '💼' }
};

export const mockInvestmentAssets: InvestmentAsset[] = [
	{
		id: '1',
		name: 'Bank Central Asia',
		type: 'stocks',
		ticker: 'BBCA',
		quantity: 100,
		purchasePrice: 8500,
		currentPrice: 9250,
		purchaseDate: new Date('2023-03-15'),
		currency: 'IDR',
		notes: 'Blue chip stock'
	},
	{
		id: '2',
		name: 'Bitcoin',
		type: 'crypto',
		ticker: 'BTC',
		quantity: 0.15,
		purchasePrice: 450000000,
		currentPrice: 620000000,
		purchaseDate: new Date('2022-11-20'),
		currency: 'IDR',
		notes: 'Long term hold'
	},
	{
		id: '3',
		name: 'Ethereum',
		type: 'crypto',
		ticker: 'ETH',
		quantity: 2.5,
		purchasePrice: 25000000,
		currentPrice: 35000000,
		purchaseDate: new Date('2023-01-10'),
		currency: 'IDR'
	},
	{
		id: '4',
		name: 'Bank Rakyat Indonesia',
		type: 'stocks',
		ticker: 'BBRI',
		quantity: 200,
		purchasePrice: 4850,
		currentPrice: 5150,
		purchaseDate: new Date('2023-05-20'),
		currency: 'IDR'
	},
	{
		id: '5',
		name: 'Sucorinvest Money Market Fund',
		type: 'mutual-funds',
		quantity: 10000,
		purchasePrice: 1000,
		currentPrice: 1045,
		purchaseDate: new Date('2023-02-01'),
		currency: 'IDR',
		notes: 'Emergency fund allocation'
	},
	{
		id: '6',
		name: 'GoTo Gojek Tokopedia',
		type: 'stocks',
		ticker: 'GOTO',
		quantity: 5000,
		purchasePrice: 338,
		currentPrice: 50,
		purchaseDate: new Date('2022-04-11'),
		currency: 'IDR',
		notes: 'IPO investment'
	},
	{
		id: '7',
		name: 'Solana',
		type: 'crypto',
		ticker: 'SOL',
		quantity: 10,
		purchasePrice: 350000,
		currentPrice: 980000,
		purchaseDate: new Date('2023-06-15'),
		currency: 'IDR'
	},
	{
		id: '8',
		name: 'Gold ETF',
		type: 'etf',
		ticker: 'XAUUSD',
		quantity: 5,
		purchasePrice: 900000,
		currentPrice: 950000,
		purchaseDate: new Date('2023-03-01'),
		currency: 'IDR',
		notes: 'Gold exposure'
	}
];

export function calculateTotalInvestmentAssets(assets: InvestmentAsset[]): {
	totalInvested: number;
	totalCurrentValue: number;
	totalGainLoss: number;
	totalGainLossPercent: number;
} {
	const totalInvested = assets.reduce((total, asset) => 
		total + (asset.purchasePrice * asset.quantity), 0);
	const totalCurrentValue = assets.reduce((total, asset) => 
		total + (asset.currentPrice * asset.quantity), 0);
	const totalGainLoss = totalCurrentValue - totalInvested;
	const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
	
	return {
		totalInvested,
		totalCurrentValue,
		totalGainLoss,
		totalGainLossPercent
	};
}

export function calculateAssetGainLoss(asset: InvestmentAsset): {
	totalInvested: number;
	currentValue: number;
	gainLoss: number;
	gainLossPercent: number;
} {
	const totalInvested = asset.purchasePrice * asset.quantity;
	const currentValue = asset.currentPrice * asset.quantity;
	const gainLoss = currentValue - totalInvested;
	const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
	
	return {
		totalInvested,
		currentValue,
		gainLoss,
		gainLossPercent
	};
}

export function groupAssetsByType(assets: InvestmentAsset[]): Record<string, InvestmentAsset[]> {
	return assets.reduce((groups, asset) => {
		const type = asset.type;
		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push(asset);
		return groups;
	}, {} as Record<string, InvestmentAsset[]>);
}