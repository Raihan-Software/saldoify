import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import {
	mockUserPreferences,
	commonCurrencies,
	numberFormats,
	mockDebtTypes,
	mockAssetTypes,
	mockTransactionCategories
} from '$lib/mock-data';

const updatePreferencesSchema = z.object({
	currencyCode: z.string().optional(),
	currencyDisplay: z.enum(['symbol', 'code', 'both']).optional(),
	numberFormat: z.string().optional(),
	compactNumbers: z.boolean().optional()
});

const debtTypeSchema = z.object({
	label: z.string().min(1, 'Label is required'),
	icon: z.string().min(1, 'Icon is required')
});

const assetTypeSchema = z.object({
	category: z.enum(['liquid', 'non_liquid', 'investment']),
	label: z.string().min(1, 'Label is required'),
	icon: z.string().min(1, 'Icon is required')
});

const transactionCategorySchema = z.object({
	type: z.enum(['income', 'expense', 'transfer']),
	label: z.string().min(1, 'Label is required')
});

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/login');
	}
	return {
		preferences: mockUserPreferences,
		currencies: commonCurrencies,
		numberFormats,
		debtTypes: mockDebtTypes,
		assetTypes: mockAssetTypes,
		transactionCategories: mockTransactionCategories
	};
};

export const actions = {
	updatePreferences: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			currencyCode: formData.get('currencyCode')?.toString(),
			currencyDisplay: formData.get('currencyDisplay')?.toString() as 'symbol' | 'code' | 'both' | undefined,
			numberFormat: formData.get('numberFormat')?.toString(),
			compactNumbers: formData.get('compactNumbers') === 'true'
		};

		const result = updatePreferencesSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}

		// Mock success response
		return { success: true };
	},

	createDebtType: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			label: formData.get('label')?.toString() || '',
			icon: formData.get('icon')?.toString() || ''
		};

		const result = debtTypeSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}

		// Mock success response
		return { success: true };
	},

	updateDebtType: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing debt type ID' });
		}

		const data = {
			label: formData.get('label')?.toString() || '',
			icon: formData.get('icon')?.toString() || ''
		};

		const result = debtTypeSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}

		// Mock success response
		return { success: true };
	},

	deleteDebtType: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing debt type ID' });
		}

		// Mock success response
		return { success: true };
	},

	createAssetType: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			category: formData.get('category')?.toString() as 'liquid' | 'non_liquid' | 'investment' | undefined,
			label: formData.get('label')?.toString() || '',
			icon: formData.get('icon')?.toString() || ''
		};

		const result = assetTypeSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}

		// Mock success response
		return { success: true };
	},

	updateAssetType: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing asset type ID' });
		}

		const data = {
			label: formData.get('label')?.toString() || '',
			icon: formData.get('icon')?.toString() || ''
		};

		const partialSchema = assetTypeSchema.omit({ category: true });
		const result = partialSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}

		// Mock success response
		return { success: true };
	},

	deleteAssetType: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing asset type ID' });
		}

		// Mock success response
		return { success: true };
	},

	createTransactionCategory: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			type: formData.get('type')?.toString() as 'income' | 'expense' | 'transfer' | undefined,
			label: formData.get('label')?.toString() || ''
		};

		const result = transactionCategorySchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}

		// Mock success response
		return { success: true };
	},

	updateTransactionCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing transaction category ID' });
		}

		const data = {
			label: formData.get('label')?.toString() || ''
		};

		const partialSchema = transactionCategorySchema.omit({ type: true });
		const result = partialSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}

		// Mock success response
		return { success: true };
	},

	deleteTransactionCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing transaction category ID' });
		}

		// Mock success response
		return { success: true };
	}
} satisfies Actions;