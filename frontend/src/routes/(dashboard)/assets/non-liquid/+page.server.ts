import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { 
	getMockAssetsByType, 
	getMockAssetSummaryByType, 
	mockAssetTypes,
	mockUserPreferences
} from '$lib/mock-data';

const nonLiquidAssetSchema = z.object({
	assetTypeId: z.string().min(1, 'Asset type is required'),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	currentValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid value format'),
	purchaseValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid value format').optional(),
	purchaseDate: z.string().optional(),
	location: z.string().optional(),
	quantity: z.coerce.number().int().positive().optional(),
	notes: z.string().optional()
});

export const load: PageServerLoad = async () => {
	return {
		assets: getMockAssetsByType('non_liquid'),
		nonLiquidAssetTypes: mockAssetTypes.non_liquid,
		summary: getMockAssetSummaryByType('non_liquid'),
		preferences: mockUserPreferences
	};
};

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			assetTypeId: formData.get('assetTypeId')?.toString() || '',
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || undefined,
			currentValue: formData.get('currentValue')?.toString() || '',
			purchaseValue: formData.get('purchaseValue')?.toString() || undefined,
			purchaseDate: formData.get('purchaseDate')?.toString() || undefined,
			location: formData.get('location')?.toString() || undefined,
			quantity: formData.get('quantity') ? parseInt(formData.get('quantity')!.toString()) : undefined,
			notes: formData.get('notes')?.toString() || undefined
		};
		
		const result = nonLiquidAssetSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		// Mock success response
		return { success: true };
	},
	
	update: async ({ request }) => {
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
			location: formData.get('location')?.toString() || undefined,
			quantity: formData.get('quantity') ? parseInt(formData.get('quantity')!.toString()) : undefined,
			notes: formData.get('notes')?.toString() || undefined
		};
		
		const partialSchema = nonLiquidAssetSchema.omit({ assetTypeId: true });
		const result = partialSchema.safeParse(data);
		
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		// Mock success response
		return { success: true };
	},
	
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		
		if (!id) {
			return fail(400, {
				error: 'Missing asset ID'
			});
		}
		
		// Mock success response
		return { success: true };
	}
} satisfies Actions;