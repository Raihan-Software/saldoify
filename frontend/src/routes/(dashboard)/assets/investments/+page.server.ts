import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import {
	getMockAssetsByType,
	getMockAssetSummaryByType,
	mockAssetTypes,
	mockUserPreferences
} from '$lib/mock-data';

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
	// Check if user is authenticated
	if (!locals.user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/login');
	}
	return {
		assets: getMockAssetsByType('investment'),
		investmentAssetTypes: mockAssetTypes.investment,
		summary: getMockAssetSummaryByType('investment'),
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