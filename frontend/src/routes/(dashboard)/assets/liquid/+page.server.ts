import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import {
	getMockAssetsByType,
	getMockAssetSummaryByType,
	mockAssetTypes,
	mockUserPreferences
} from '$lib/mock-data';

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
	// Check if user is authenticated
	if (!locals.user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/login');
	}
	return {
		assets: getMockAssetsByType('liquid'),
		liquidAssetTypes: mockAssetTypes.liquid,
		summary: getMockAssetSummaryByType('liquid'),
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