import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generate a preferences ID
function generatePreferencesId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Create default preferences for a new user
export async function createDefaultPreferences(userId: string) {
	const preferencesId = generatePreferencesId();
	
	try {
		const [preferences] = await db
			.insert(table.userPreferences)
			.values({
				id: preferencesId,
				userId
			})
			.returning();
		
		return preferences;
	} catch (error) {
		console.error('Failed to create default preferences:', error);
		throw error;
	}
}

// Get user preferences
export async function getUserPreferences(userId: string) {
	const [preferences] = await db
		.select()
		.from(table.userPreferences)
		.where(eq(table.userPreferences.userId, userId));
	
	// If no preferences exist, create default ones
	if (!preferences) {
		return await createDefaultPreferences(userId);
	}
	
	return preferences;
}

// Update user preferences
export async function updateUserPreferences(
	userId: string,
	updates: Partial<Omit<table.UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
) {
	const [updated] = await db
		.update(table.userPreferences)
		.set({
			...updates,
			updatedAt: new Date()
		})
		.where(eq(table.userPreferences.userId, userId))
		.returning();
	
	return updated;
}

// Common currencies list (matching the dropdown in settings)
export const commonCurrencies = [
	{ code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
	{ code: 'USD', name: 'US Dollar', symbol: '$' },
	{ code: 'EUR', name: 'Euro', symbol: '€' },
	{ code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
	{ code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
	{ code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
	{ code: 'GBP', name: 'British Pound', symbol: '£' },
	{ code: 'AUD', name: 'Australian Dollar', symbol: '$' }
];

// Number format options (matching the dropdown in settings)
export const numberFormats = [
	{ value: '1.234.567,89', label: '1.234.567,89 (Indonesia)', thousandSep: '.', decimalSep: ',' },
	{ value: '1,234,567.89', label: '1,234,567.89 (US/UK)', thousandSep: ',', decimalSep: '.' },
	{ value: '1 234 567,89', label: '1 234 567,89 (France)', thousandSep: ' ', decimalSep: ',' },
	{ value: '1\'234\'567.89', label: '1\'234\'567.89 (Switzerland)', thousandSep: '\'', decimalSep: '.' }
];

// Format currency based on user preferences
export function formatCurrency(amount: number, preferences: table.UserPreferences): string {
	const { currencyCode, currencyDisplay, numberFormat, compactNumbers } = preferences;
	
	// Find currency details
	const currency = commonCurrencies.find(c => c.code === currencyCode) || commonCurrencies[0];
	
	// Find number format details
	const format = numberFormats.find(f => f.value === numberFormat) || numberFormats[0];
	
	// Handle compact numbers
	if (compactNumbers && Math.abs(amount) >= 1000000) {
		const millions = amount / 1000000;
		const formatted = millions.toFixed(1);
		return formatWithCurrency(formatted + 'M', currency, currencyDisplay);
	} else if (compactNumbers && Math.abs(amount) >= 1000) {
		const thousands = amount / 1000;
		const formatted = thousands.toFixed(1);
		return formatWithCurrency(formatted + 'K', currency, currencyDisplay);
	}
	
	// Format number with thousand and decimal separators
	const fixed = amount.toFixed(2);
	const [integerPart, decimalPart] = fixed.split('.');
	const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandSep);
	const formattedNumber = formattedInteger + format.decimalSep + decimalPart;
	
	return formatWithCurrency(formattedNumber, currency, currencyDisplay);
}

function formatWithCurrency(
	formattedNumber: string, 
	currency: { code: string; symbol: string }, 
	display: string
): string {
	switch (display) {
		case 'symbol':
			return currency.symbol + formattedNumber;
		case 'code':
			return currency.code + ' ' + formattedNumber;
		case 'both':
			return currency.code + ' ' + currency.symbol + formattedNumber;
		default:
			return currency.symbol + formattedNumber;
	}
}