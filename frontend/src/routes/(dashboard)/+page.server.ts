import type { PageServerLoad } from './$types';
import { 
	getMockAssetsByType, 
	getMockAssetSummaryByType, 
	getMockDebts, 
	getMockDebtSummary,
	getMockRecentTransactions,
	getMockTopSpendingCategories,
	getMockMonthlyTransactionSummary,
	mockUserPreferences
} from '$lib/mock-data';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	
	return {
		preferences: mockUserPreferences,
		dashboardData: loadDashboardData(now, startOfMonth)
	};
};

function loadDashboardData(now: Date, startOfMonth: Date) {
	// Get mock data
	const liquidAssets = getMockAssetsByType('liquid');
	const liquidSummary = getMockAssetSummaryByType('liquid');
	const nonLiquidAssets = getMockAssetsByType('non_liquid');
	const nonLiquidSummary = getMockAssetSummaryByType('non_liquid');
	const investmentAssets = getMockAssetsByType('investment');
	const investmentSummary = getMockAssetSummaryByType('investment');
	const debts = getMockDebts();
	const debtSummary = getMockDebtSummary();
	const recentTransactions = getMockRecentTransactions(10);
	const monthlyTotals = getMockMonthlyTransactionSummary(now.getFullYear(), now.getMonth() + 1);
	const topCategories = getMockTopSpendingCategories(now.getFullYear(), now.getMonth() + 1, 5);
	
	// Calculate net worth data
	const totalAssets = liquidSummary.totalValue + nonLiquidSummary.totalValue + investmentSummary.totalValue;
	const totalLiabilities = debtSummary.totalDebt;
	const netWorth = totalAssets - totalLiabilities;
	
	// Calculate savings rate
	const savingsRate = monthlyTotals.income > 0 
		? ((monthlyTotals.income - monthlyTotals.expense) / monthlyTotals.income) * 100 
		: 0;
	
	return {
		netWorthData: {
			assets: {
				liquid: liquidSummary.totalValue,
				nonLiquid: nonLiquidSummary.totalValue,
				investment: investmentSummary.totalValue,
				total: totalAssets
			},
			liabilities: {
				total: totalLiabilities
			},
			netWorth
		},
		monthlyData: {
			income: monthlyTotals.income,
			expenses: monthlyTotals.expense,
			net: monthlyTotals.income - monthlyTotals.expense,
			savingsRate
		},
		recentTransactions,
		topCategories,
		accountBalances: [
			{ name: 'Liquid Assets', amount: liquidSummary.totalValue, icon: '💵', color: 'text-green-600' },
			{ name: 'Investments', amount: investmentSummary.totalValue, icon: '📈', color: 'text-blue-600' },
			{ name: 'Non-Liquid Assets', amount: nonLiquidSummary.totalValue, icon: '📦', color: 'text-purple-600' },
			{ name: 'Total Debt', amount: -totalLiabilities, icon: '💳', color: 'text-red-600' }
		]
	};
}