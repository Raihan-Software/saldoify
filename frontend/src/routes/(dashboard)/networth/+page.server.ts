import type { PageServerLoad } from './$types';
import { getUserAssetsByType, getAssetSummaryByType } from '$lib/server/assets';
import { getUserPreferences } from '$lib/server/preferences';
import { getUserDebts, getDebtSummary } from '$lib/server/debts';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	// Get all asset types from the database
	const [liquidAssets, nonLiquidAssets, investmentAssets, debts, preferences] = await Promise.all([
		getUserAssetsByType(locals.user.id, 'liquid'),
		getUserAssetsByType(locals.user.id, 'non_liquid'),
		getUserAssetsByType(locals.user.id, 'investment'),
		getUserDebts(locals.user.id),
		getUserPreferences(locals.user.id)
	]);
	
	// Get summaries for each asset type and debts
	const [liquidSummary, nonLiquidSummary, investmentSummary, debtSummary] = await Promise.all([
		getAssetSummaryByType(locals.user.id, 'liquid'),
		getAssetSummaryByType(locals.user.id, 'non_liquid'),
		getAssetSummaryByType(locals.user.id, 'investment'),
		getDebtSummary(locals.user.id)
	]);
	
	return {
		assets: {
			liquid: liquidAssets,
			nonLiquid: nonLiquidAssets,
			investment: investmentAssets
		},
		debts,
		summaries: {
			liquid: liquidSummary,
			nonLiquid: nonLiquidSummary,
			investment: investmentSummary,
			debt: debtSummary
		},
		preferences
	};
};