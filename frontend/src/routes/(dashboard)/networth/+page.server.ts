import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {
	getMockAssetsByType,
	getMockAssetSummaryByType,
	getMockDebts,
	getMockDebtSummary,
	mockUserPreferences
} from '$lib/mock-data';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/login');
	}
	// Get all asset types from mock data
	const liquidAssets = getMockAssetsByType('liquid');
	const nonLiquidAssets = getMockAssetsByType('non_liquid');
	const investmentAssets = getMockAssetsByType('investment');
	const debts = getMockDebts();

	// Get summaries for each asset type and debts
	const liquidSummary = getMockAssetSummaryByType('liquid');
	const nonLiquidSummary = getMockAssetSummaryByType('non_liquid');
	const investmentSummary = getMockAssetSummaryByType('investment');
	const debtSummary = getMockDebtSummary();

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
		preferences: mockUserPreferences
	};
};