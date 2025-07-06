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
		monthlyTotals,
		preferences
	] = await Promise.all([
		getUserAssetsByType(locals.user.id, 'liquid'),
		getAssetSummaryByType(locals.user.id, 'liquid'),
		getUserAssetsByType(locals.user.id, 'non_liquid'),
		getAssetSummaryByType(locals.user.id, 'non_liquid'),
		getUserAssetsByType(locals.user.id, 'investment'),
		getAssetSummaryByType(locals.user.id, 'investment'),
		getUserDebts(locals.user.id),
		getDebtSummary(locals.user.id),
		getUserTransactions(locals.user.id),
		getMonthlyTransactionSummary(locals.user.id, now.getFullYear(), now.getMonth() + 1),
		getUserPreferences(locals.user.id)
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
			{ name: 'Properties', amount: nonLiquidSummary.totalValue, icon: '🏠', color: 'text-purple-600' },
			{ name: 'Total Debt', amount: -totalLiabilities, icon: '💳', color: 'text-red-600' }
		],
		preferences
	};
};