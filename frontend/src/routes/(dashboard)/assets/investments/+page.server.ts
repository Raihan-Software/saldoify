import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getUserAssetsByType, createAsset, updateAsset, deleteAsset, getAssetSummaryByType } from '$lib/server/assets';
import { getUserAssetTypes } from '$lib/server/asset-types';
import { getUserPreferences } from '$lib/server/preferences';

const investmentAssetSchema = z.object({
	assetTypeId: z.string().min(1, 'Asset type is required'),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	currentValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid value format'),
	purchaseValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid value format').optional(),
	purchaseDate: z.string().optional(),
	ticker: z.string().optional(),
	shares: z.string().optional(),
	notes: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	const [assets, assetTypes, summary, preferences] = await Promise.all([
		getUserAssetsByType(locals.user.id, 'investment'),
		getUserAssetTypes(locals.user.id),
		getAssetSummaryByType(locals.user.id, 'investment'),
		getUserPreferences(locals.user.id)
	]);
	
	return {
		assets,
		investmentAssetTypes: assetTypes.investment,
		summary,
		preferences
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const data = {
			assetTypeId: formData.get('assetTypeId')?.toString() || '',
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || undefined,
			currentValue: formData.get('currentValue')?.toString() || '',
			purchaseValue: formData.get('purchaseValue')?.toString() || undefined,
			purchaseDate: formData.get('purchaseDate')?.toString() || undefined,
			ticker: formData.get('ticker')?.toString() || undefined,
			shares: formData.get('shares')?.toString() || undefined,
			notes: formData.get('notes')?.toString() || undefined
		};
		
		const result = investmentAssetSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		try {
			const assetData = {
				type: 'investment' as const,
				...result.data,
				purchaseDate: result.data.purchaseDate ? new Date(result.data.purchaseDate) : undefined
			};
			
			await createAsset(locals.user.id, assetData);
			return { success: true };
		} catch (error) {
			console.error('Failed to create investment asset:', error);
			return fail(500, {
				error: 'Failed to create asset'
			});
		}
	},
	
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		
		if (!id) {
			return fail(400, {
				error: 'Missing asset ID'
			});
		}
		
		const data = {
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || undefined,
			currentValue: formData.get('currentValue')?.toString() || '',
			purchaseValue: formData.get('purchaseValue')?.toString() || undefined,
			purchaseDate: formData.get('purchaseDate')?.toString() || undefined,
			ticker: formData.get('ticker')?.toString() || undefined,
			shares: formData.get('shares')?.toString() || undefined,
			notes: formData.get('notes')?.toString() || undefined
		};
		
		const partialSchema = investmentAssetSchema.omit({ assetTypeId: true });
		const result = partialSchema.safeParse(data);
		
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		try {
			const updateData = {
				...result.data,
				purchaseDate: result.data.purchaseDate ? new Date(result.data.purchaseDate) : undefined
			};
			
			await updateAsset(locals.user.id, id, updateData);
			return { success: true };
		} catch (error) {
			console.error('Failed to update investment asset:', error);
			return fail(500, {
				error: 'Failed to update asset'
			});
		}
	},
	
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		
		if (!id) {
			return fail(400, {
				error: 'Missing asset ID'
			});
		}
		
		try {
			await deleteAsset(locals.user.id, id);
			return { success: true };
		} catch (error) {
			console.error('Failed to delete investment asset:', error);
			return fail(500, {
				error: 'Failed to delete asset'
			});
		}
	}
} satisfies Actions;