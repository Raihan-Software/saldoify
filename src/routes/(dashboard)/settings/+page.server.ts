import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getUserPreferences, updateUserPreferences, commonCurrencies, numberFormats } from '$lib/server/preferences';
import { getUserDebtTypes, createDebtType, updateDebtType, deleteDebtType } from '$lib/server/debt-types';

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

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	const preferences = await getUserPreferences(locals.user.id);
	const debtTypes = await getUserDebtTypes(locals.user.id);
	
	return {
		preferences,
		currencies: commonCurrencies,
		numberFormats,
		debtTypes
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
	}
} satisfies Actions;