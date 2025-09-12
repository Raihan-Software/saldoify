import type { PageServerLoad } from './$types';
import { getUserAssetsByType, getAssetSummaryByType } from '$lib/server/assets';
import { getUserDebts, getDebtSummary } from '$lib/server/debts';
import { getUserTransactions, getMonthlyTransactionSummary } from '$lib/server/transactions';
import { getUserPreferences } from '$lib/server/preferences';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	
	return {
		preferences: getUserPreferences(locals.user.id),
		dashboardData: loadDashboardData(locals.user.id, now, startOfMonth)
	};
};

async function loadDashboardData(userId: string, now: Date, startOfMonth: Date) {
	// Fetch all data in parallel
	const [
		liquidAssets,
		liquidSummary,
		nonLiquidAssets,
		nonLiquidSummary,
		investmentAssets,
		investmentSummary,
		debts,
		debtSummary,
		allTransactions,
		monthlyTotals
	] = await Promise.all([
		getUserAssetsByType(userId, 'liquid'),
		getAssetSummaryByType(userId, 'liquid'),
		getUserAssetsByType(userId, 'non_liquid'),
		getAssetSummaryByType(userId, 'non_liquid'),
		getUserAssetsByType(userId, 'investment'),
		getAssetSummaryByType(userId, 'investment'),
		getUserDebts(userId),
		getDebtSummary(userId),
		getUserTransactions(userId),
		getMonthlyTransactionSummary(userId, now.getFullYear(), now.getMonth() + 1)
	]);
	
	// Get recent transactions (last 10)
	const recentTransactions = allTransactions.slice(0, 10);
	
	// Calculate top spending categories for the current month
	const monthTransactions = allTransactions.filter(t => {
		const transDate = new Date(t.transactionDate);
		return transDate >= startOfMonth && t.type === 'expense';
	});
	
	const categoryTotals: Record<string, { amount: number; label: string }> = {};
	monthTransactions.forEach(t => {
		const categoryKey = t.category?.label || 'Other';
		if (!categoryTotals[categoryKey]) {
			categoryTotals[categoryKey] = { amount: 0, label: categoryKey };
		}
		categoryTotals[categoryKey].amount += parseFloat(t.amount);
	});
	
	const topCategories = Object.values(categoryTotals)
		.sort((a, b) => b.amount - a.amount)
		.slice(0, 5);
	
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