import type { PageServerLoad, Actions } from './$types';
import { 
	getMockAssetsByType, 
	mockTransactionCategories, 
	mockTransactions,
	getMockMonthlyTransactionSummary
} from '$lib/mock-data';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const now = new Date();
	
	return {
		liquidAssets: getMockAssetsByType('liquid'),
		transactionCategories: mockTransactionCategories,
		transactions: mockTransactions,
		monthlyTotals: getMockMonthlyTransactionSummary(now.getFullYear(), now.getMonth() + 1)
	};
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const type = data.get('type') as 'income' | 'expense' | 'transfer';
		const categoryId = data.get('categoryId') as string;
		const description = data.get('description') as string;
		const amount = parseFloat(data.get('amount') as string);
		const assetId = data.get('assetId') as string;
		const dateTimeString = data.get('transactionDate') as string;
		const clientTimezoneOffset = parseInt(data.get('timezoneOffset') as string) || 0;
		
		// Convert timezone offset to ISO format (e.g., -420 becomes "+07:00")
		const offsetHours = Math.floor(Math.abs(clientTimezoneOffset) / 60);
		const offsetMinutes = Math.abs(clientTimezoneOffset) % 60;
		const offsetSign = clientTimezoneOffset <= 0 ? '+' : '-';
		const isoOffset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
		
		// Append timezone to make it a proper ISO string
		const isoDateString = `${dateTimeString}:00${isoOffset}`;
		
		// Parse with timezone information
		const transactionDate = new Date(isoDateString);
		const notes = data.get('notes') as string;
		
		// Handle transfers separately
		if (type === 'transfer') {
			const fromAccountId = data.get('fromAccount') as string;
			const toAccountId = data.get('toAccount') as string;
			
			if (!fromAccountId || !toAccountId) {
				return fail(400, { message: 'Transfer requires both source and destination accounts' });
			}
			
			if (fromAccountId === toAccountId) {
				return fail(400, { message: 'Cannot transfer to the same account' });
			}
			
			// Validate other required fields
			if (!categoryId || !description || !amount || !transactionDate) {
				return fail(400, { message: 'Missing required fields' });
			}
			
			// Mock success response
			return { success: true };
		}
		
		// Regular income/expense transaction
		// Validate required fields
		if (!type || !categoryId || !description || !amount || !assetId || !transactionDate) {
			return fail(400, { message: 'Missing required fields' });
		}
		
		// Mock success response
		return { success: true };
	},
	
	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const type = data.get('type') as 'income' | 'expense';
		const categoryId = data.get('categoryId') as string;
		const description = data.get('description') as string;
		const amount = parseFloat(data.get('amount') as string);
		const assetId = data.get('assetId') as string;
		const dateTimeString = data.get('transactionDate') as string;
		const clientTimezoneOffset = parseInt(data.get('timezoneOffset') as string) || 0;
		
		// Convert timezone offset to ISO format (e.g., -420 becomes "+07:00")
		const offsetHours = Math.floor(Math.abs(clientTimezoneOffset) / 60);
		const offsetMinutes = Math.abs(clientTimezoneOffset) % 60;
		const offsetSign = clientTimezoneOffset <= 0 ? '+' : '-';
		const isoOffset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
		
		// Append timezone to make it a proper ISO string
		const isoDateString = `${dateTimeString}:00${isoOffset}`;
		
		// Parse with timezone information
		const transactionDate = new Date(isoDateString);
		const notes = data.get('notes') as string;
		
		// Validate required fields
		if (!id || !type || !categoryId || !description || !amount || !assetId || !transactionDate) {
			return fail(400, { message: 'Missing required fields' });
		}
		
		// Mock success response
		return { success: true };
	},
	
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		
		if (!id) {
			return fail(400, { message: 'Missing transaction ID' });
		}
		
		// Mock success response
		return { success: true };
	}
} satisfies Actions;