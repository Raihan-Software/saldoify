import type { PageServerLoad } from './$types';
import { getUserAssetsByType, getAssetSummaryByType } from '$lib/server/assets';
import { getUserPreferences } from '$lib/server/preferences';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	// Get all asset types from the database
	const [liquidAssets, nonLiquidAssets, investmentAssets, preferences] = await Promise.all([
		getUserAssetsByType(locals.user.id, 'liquid'),
		getUserAssetsByType(locals.user.id, 'non_liquid'),
		getUserAssetsByType(locals.user.id, 'investment'),
		getUserPreferences(locals.user.id)
	]);
	
	// Get summaries for each asset type
	const [liquidSummary, nonLiquidSummary, investmentSummary] = await Promise.all([
		getAssetSummaryByType(locals.user.id, 'liquid'),
		getAssetSummaryByType(locals.user.id, 'non_liquid'),
		getAssetSummaryByType(locals.user.id, 'investment')
	]);
	
	return {
		assets: {
			liquid: liquidAssets,
			nonLiquid: nonLiquidAssets,
			investment: investmentAssets
		},
		summaries: {
			liquid: liquidSummary,
			nonLiquid: nonLiquidSummary,
			investment: investmentSummary
		},
		preferences
	};
};