import type { PageServerLoad } from './$types';
import { getUserAssetsByType } from '$lib/server/assets';
import { getUserTransactionCategories } from '$lib/server/transaction-categories';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}

	// Fetch liquid assets for account dropdowns
	const liquidAssets = await getUserAssetsByType(locals.user.id, 'liquid');
	
	// Fetch transaction categories
	const transactionCategories = await getUserTransactionCategories(locals.user.id);
	
	return {
		liquidAssets,
		transactionCategories
	};
}
