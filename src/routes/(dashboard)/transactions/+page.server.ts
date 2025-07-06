import type { PageServerLoad } from './$types';
import { getUserAssetsByType } from '$lib/server/assets';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}

	// Fetch liquid assets for account dropdowns
	const liquidAssets = await getUserAssetsByType(locals.user.id, 'liquid');
	return {
		liquidAssets,
	};
}
