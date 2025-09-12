import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getUserPreferences, updateUserPreferences, commonCurrencies, numberFormats } from '$lib/server/preferences';
import { getUserDebtTypes, createDebtType, updateDebtType, deleteDebtType } from '$lib/server/debt-types';
import { getUserAssetTypes, createAssetType, updateAssetType, deleteAssetType } from '$lib/server/asset-types';
import { getUserTransactionCategories, createTransactionCategory, updateTransactionCategory, deleteTransactionCategory } from '$lib/server/transaction-categories';

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
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	const preferences = await getUserPreferences(locals.user.id);
	const debtTypes = await getUserDebtTypes(locals.user.id);
	const assetTypes = await getUserAssetTypes(locals.user.id);
	const transactionCategories = await getUserTransactionCategories(locals.user.id);
	
	return {
		preferences,
		currencies: commonCurrencies,
		numberFormats,
		debtTypes,
		assetTypes,
		transactionCategories
	};
};

export const actions = {
	updatePreferences: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const data: Record<string, any> = {};
		
		// Process form data - get values from the select elements
		const currency = formData.get('currency');
		const currencyDisplay = formData.get('currency-display');
		const numberFormat = formData.get('number-format');
		const compactNumbers = formData.get('compact-numbers');
		
		if (currency) data.currencyCode = currency.toString();
		if (currencyDisplay) data.currencyDisplay = currencyDisplay.toString();
		if (numberFormat) data.numberFormat = numberFormat.toString();
		data.compactNumbers = compactNumbers === 'on';
		
		// Validate the data
		const result = updatePreferencesSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: 'Invalid form data'
			});
		}
		
		try {
			// Update preferences
			await updateUserPreferences(locals.user.id, result.data);
			
			return {
				success: true
			};
		} catch (error) {
			console.error('Failed to update preferences:', error);
			return fail(500, {
				error: 'Failed to save settings'
			});
		}
	},
	
	createDebtType: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
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
		
		try {
			await createDebtType(locals.user.id, result.data);
			return { success: true };
		} catch (error) {
			console.error('Failed to create debt type:', error);
			return fail(500, {
				error: 'Failed to create debt type'
			});
		}
	},
	
	updateDebtType: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const label = formData.get('label')?.toString();
		
		if (!id || !label) {
			return fail(400, {
				error: 'Missing required fields'
			});
		}
		
		try {
			await updateDebtType(locals.user.id, id, { label });
			return { success: true };
		} catch (error) {
			console.error('Failed to update debt type:', error);
			return fail(500, {
				error: 'Failed to update debt type'
			});
		}
	},
	
	deleteDebtType: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		
		if (!id) {
			return fail(400, {
				error: 'Missing debt type ID'
			});
		}
		
		try {
			const deleted = await deleteDebtType(locals.user.id, id);
			if (!deleted) {
				return fail(400, {
					error: 'Cannot delete system debt type'
				});
			}
			return { success: true };
		} catch (error) {
			console.error('Failed to delete debt type:', error);
			return fail(500, {
				error: 'Failed to delete debt type'
			});
		}
	},
	
	// Asset Type Actions
	createAssetType: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const data = {
			category: formData.get('category')?.toString() || '',
			label: formData.get('label')?.toString() || '',
			icon: formData.get('icon')?.toString() || ''
		};
		
		const result = assetTypeSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		try {
			await createAssetType(locals.user.id, result.data);
			return { success: true };
		} catch (error) {
			console.error('Failed to create asset type:', error);
			return fail(500, {
				error: 'Failed to create asset type'
			});
		}
	},
	
	updateAssetType: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const label = formData.get('label')?.toString();
		
		if (!id || !label) {
			return fail(400, {
				error: 'Missing required fields'
			});
		}
		
		try {
			await updateAssetType(locals.user.id, id, { label });
			return { success: true };
		} catch (error) {
			console.error('Failed to update asset type:', error);
			return fail(500, {
				error: 'Failed to update asset type'
			});
		}
	},
	
	deleteAssetType: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		
		if (!id) {
			return fail(400, {
				error: 'Missing asset type ID'
			});
		}
		
		try {
			const deleted = await deleteAssetType(locals.user.id, id);
			if (!deleted) {
				return fail(400, {
					error: 'Cannot delete system asset type'
				});
			}
			return { success: true };
		} catch (error) {
			console.error('Failed to delete asset type:', error);
			return fail(500, {
				error: 'Failed to delete asset type'
			});
		}
	},
	
	// Transaction Category Actions
	createTransactionCategory: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const data = {
			type: formData.get('type')?.toString() || '',
			label: formData.get('label')?.toString() || ''
		};
		
		const result = transactionCategorySchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				error: result.error.flatten().fieldErrors
			});
		}
		
		try {
			await createTransactionCategory(locals.user.id, result.data);
			return { success: true };
		} catch (error) {
			console.error('Failed to create transaction category:', error);
			return fail(500, {
				error: 'Failed to create transaction category'
			});
		}
	},
	
	updateTransactionCategory: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const label = formData.get('label')?.toString();
		
		if (!id || !label) {
			return fail(400, {
				error: 'Missing required fields'
			});
		}
		
		try {
			await updateTransactionCategory(locals.user.id, id, { label });
			return { success: true };
		} catch (error) {
			console.error('Failed to update transaction category:', error);
			return fail(500, {
				error: 'Failed to update transaction category'
			});
		}
	},
	
	deleteTransactionCategory: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}
		
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		
		if (!id) {
			return fail(400, {
				error: 'Missing transaction category ID'
			});
		}
		
		try {
			const deleted = await deleteTransactionCategory(locals.user.id, id);
			if (!deleted) {
				return fail(400, {
					error: 'Cannot delete system transaction category'
				});
			}
			return { success: true };
		} catch (error) {
			console.error('Failed to delete transaction category:', error);
			return fail(500, {
				error: 'Failed to delete transaction category'
			});
		}
	}
} satisfies Actions;