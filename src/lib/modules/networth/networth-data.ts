import { mockLiquidAssets, calculateTotalLiquidAssets } from '../assets/liquid/liquid-assets-data';
import { mockNonLiquidAssets, calculateTotalNonLiquidAssets } from '../assets/non-liquid/non-liquid-assets-data';
import { mockInvestmentAssets, calculateTotalInvestmentAssets } from '../assets/investment/investment-assets-data';

export interface Liability {
	id: string;
	name: string;
	type: 'mortgage' | 'auto-loan' | 'personal-loan' | 'credit-card' | 'other';
	balance: number;
	originalAmount?: number;
	interestRate?: number;
	monthlyPayment?: number;
	notes?: string;
}

export const liabilityTypes = {
	mortgage: { label: 'Mortgage', icon: '🏠' },
	'auto-loan': { label: 'Auto Loan', icon: '🚗' },
	'personal-loan': { label: 'Personal Loan', icon: '💳' },
	'credit-card': { label: 'Credit Card', icon: '💳' },
	other: { label: 'Other Debt', icon: '📋' }
};

export const mockLiabilities: Liability[] = [
	{
		id: '1',
		name: 'Home Mortgage - BCA',
		type: 'mortgage',
		balance: 425000000,
		originalAmount: 600000000,
		interestRate: 7.5,
		monthlyPayment: 5500000,
		notes: 'Jakarta apartment'
	},
	{
		id: '2',
		name: 'Car Loan - BCA',
		type: 'auto-loan',
		balance: 180000000,
		originalAmount: 300000000,
		interestRate: 6.5,
		monthlyPayment: 6800000,
		notes: 'Toyota Innova 2022'
	},
	{
		id: '3',
		name: 'Credit Card - BCA',
		type: 'credit-card',
		balance: 5500000,
		interestRate: 2.5,
		monthlyPayment: 1000000
	},
	{
		id: '4',
		name: 'Personal Loan - Kredivo',
		type: 'personal-loan',
		balance: 12000000,
		originalAmount: 20000000,
		interestRate: 12,
		monthlyPayment: 1800000,
		notes: 'Electronics purchase'
	}
];

export function calculateNetWorth() {
	// Calculate all assets
	const liquidAssets = calculateTotalLiquidAssets(mockLiquidAssets);
	const nonLiquidAssets = calculateTotalNonLiquidAssets(mockNonLiquidAssets);
	const investmentAssets = calculateTotalInvestmentAssets(mockInvestmentAssets);
	
	const totalAssets = liquidAssets + nonLiquidAssets.totalCurrentValue + investmentAssets.totalCurrentValue;
	
	// Calculate all liabilities
	const totalLiabilities = mockLiabilities.reduce((sum, liability) => sum + liability.balance, 0);
	
	// Net worth
	const netWorth = totalAssets - totalLiabilities;
	
	return {
		assets: {
			liquid: liquidAssets,
			nonLiquid: nonLiquidAssets.totalCurrentValue,
			investment: investmentAssets.totalCurrentValue,
			total: totalAssets
		},
		liabilities: {
			total: totalLiabilities
		},
		netWorth
	};
}

export function groupAssetsByCategory() {
	return {
		liquid: mockLiquidAssets,
		nonLiquid: mockNonLiquidAssets,
		investment: mockInvestmentAssets
	};
}

export function groupLiabilitiesByType() {
	return mockLiabilities.reduce((groups, liability) => {
		const type = liability.type;
		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push(liability);
		return groups;
	}, {} as Record<string, Liability[]>);
}