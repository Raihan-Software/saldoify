import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getUserPreferences, updateUserPreferences, commonCurrencies, numberFormats } from '$lib/server/preferences';

const updatePreferencesSchema = z.object({
	currencyCode: z.string().optional(),
	currencyDisplay: z.enum(['symbol', 'code', 'both']).optional(),
	numberFormat: z.string().optional(),
	compactNumbers: z.boolean().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}
	
	const preferences = await getUserPreferences(locals.user.id);
	
	return {
		preferences,
		currencies: commonCurrencies,
		numberFormats
	};
};

export const actions = {
	default: async ({ request, locals }) => {
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
	}
} satisfies Actions;