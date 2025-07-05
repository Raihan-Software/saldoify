import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getUserAssetsByType, createAsset, updateAsset, deleteAsset, getAssetSummaryByType } from '$lib/server/assets';
import { getUserAssetTypes } from '$lib/server/asset-types';
import { getUserPreferences } from '$lib/server/preferences';

const liquidAssetSchema = z.object({
	assetTypeId: z.string().min(1, 'Asset type is required'),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	currentValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid value format'),
	accountNumber: z.string().optional(),
	bankName: z.string().optional(),
	notes: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	const [assets, assetTypes, summary, preferences] = await Promise.all([
		getUserAssetsByType(locals.user.id, 'liquid'),
		getUserAssetTypes(locals.user.id),
		getAssetSummaryByType(locals.user.id, 'liquid'),
		getUserPreferences(locals.user.id)
	]);
	
	return {
		assets,
		liquidAssetTypes: assetTypes.liquid,
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
			accountNumber: formData.get('accountNumber')?.toString() || undefined,
			bankName: formData.get('bankName')?.toString() || undefined,
			notes: formData.get('notes')?.toString() || undefined
		};
		
		const result = liquidAssetSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		try {
			await createAsset(locals.user.id, {
				type: 'liquid',
				...result.data
			});
			return { success: true };
		} catch (error) {
			console.error('Failed to create liquid asset:', error);
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
			accountNumber: formData.get('accountNumber')?.toString() || undefined,
			bankName: formData.get('bankName')?.toString() || undefined,
			notes: formData.get('notes')?.toString() || undefined
		};
		
		const partialSchema = liquidAssetSchema.omit({ assetTypeId: true });
		const result = partialSchema.safeParse(data);
		
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		try {
			await updateAsset(locals.user.id, id, result.data);
			return { success: true };
		} catch (error) {
			console.error('Failed to update liquid asset:', error);
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
			console.error('Failed to delete liquid asset:', error);
			return fail(500, {
				error: 'Failed to delete asset'
			});
		}
	}
} satisfies Actions;