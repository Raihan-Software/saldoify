import type { PageServerLoad, Actions } from './$types';
import { getUserAssetsByType } from '$lib/server/assets';
import { getUserTransactionCategories } from '$lib/server/transaction-categories';
import { getUserTransactions, createTransaction, updateTransaction, deleteTransaction, getMonthlyTransactionSummary } from '$lib/server/transactions';
import { fail } from '@sveltejs/kit';
import { parseISO } from 'date-fns';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}

	// Fetch liquid assets for account dropdowns
	const liquidAssets = await getUserAssetsByType(locals.user.id, 'liquid');
	
	// Fetch transaction categories
	const transactionCategories = await getUserTransactionCategories(locals.user.id);
	
	// Fetch user transactions
	const transactions = await getUserTransactions(locals.user.id);
	
	// Get current month summary
	const now = new Date();
	const monthlyTotals = await getMonthlyTransactionSummary(locals.user.id, now.getFullYear(), now.getMonth() + 1);
	
	return {
		liquidAssets,
		transactionCategories,
		transactions,
		monthlyTotals
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
		
		const data = await request.formData();
		const type = data.get('type') as 'income' | 'expense' | 'transfer';
		const categoryId = data.get('categoryId') as string;
		const description = data.get('description') as string;
		const amount = parseFloat(data.get('amount') as string);
		const assetId = data.get('assetId') as string;
		const transactionDate = parseISO(data.get('transactionDate') as string);
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
			
			try {
				// Create expense transaction from source account
				await createTransaction(locals.user.id, {
					type: 'expense',
					categoryId,
					description: `Transfer out: ${description}`,
					amount,
					assetId: fromAccountId,
					transactionDate,
					notes: notes ? `Transfer to destination account. ${notes}` : 'Transfer to destination account'
				});
				
				// Create income transaction to destination account
				await createTransaction(locals.user.id, {
					type: 'income',
					categoryId,
					description: `Transfer in: ${description}`,
					amount,
					assetId: toAccountId,
					transactionDate,
					notes: notes ? `Transfer from source account. ${notes}` : 'Transfer from source account'
				});
				
				return { success: true };
			} catch (error) {
				console.error('Failed to create transfer:', error);
				return fail(500, { message: 'Failed to create transfer' });
			}
		}
		
		// Regular income/expense transaction
		// Validate required fields
		if (!type || !categoryId || !description || !amount || !assetId || !transactionDate) {
			return fail(400, { message: 'Missing required fields' });
		}
		
		try {
			await createTransaction(locals.user.id, {
				type: type as 'income' | 'expense',
				categoryId,
				description,
				amount,
				assetId,
				transactionDate,
				notes: notes || undefined
			});
			
			return { success: true };
		} catch (error) {
			console.error('Failed to create transaction:', error);
			return fail(500, { message: 'Failed to create transaction' });
		}
	},
	
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
		
		const data = await request.formData();
		const id = data.get('id') as string;
		const type = data.get('type') as 'income' | 'expense';
		const categoryId = data.get('categoryId') as string;
		const description = data.get('description') as string;
		const amount = parseFloat(data.get('amount') as string);
		const assetId = data.get('assetId') as string;
		// Handle datetime-local input and convert to UTC
		const localDateString = data.get('transactionDate') as string;
		// Create a Date object from the local datetime string
		// The datetime-local input provides local time, so we need to convert to UTC
		const localDate = new Date(localDateString);
		// Convert to UTC by getting the timezone offset and adjusting
		// getTimezoneOffset() returns minutes, positive for timezones behind UTC
		const timezoneOffset = localDate.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
		const transactionDate = new Date(localDate.getTime() - timezoneOffset);
		const notes = data.get('notes') as string;
		
		// Validate required fields
		if (!id || !type || !categoryId || !description || !amount || !assetId || !transactionDate) {
			return fail(400, { message: 'Missing required fields' });
		}
		
		try {
			await updateTransaction(locals.user.id, id, {
				type,
				categoryId,
				description,
				amount,
				assetId,
				transactionDate,
				notes: notes || undefined
			});
			
			return { success: true };
		} catch (error) {
			console.error('Failed to update transaction:', error);
			return fail(500, { message: 'Failed to update transaction' });
		}
	},
	
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
		
		const data = await request.formData();
		const id = data.get('id') as string;
		
		if (!id) {
			return fail(400, { message: 'Missing transaction ID' });
		}
		
		try {
			await deleteTransaction(locals.user.id, id);
			return { success: true };
		} catch (error) {
			console.error('Failed to delete transaction:', error);
			return fail(500, { message: 'Failed to delete transaction' });
		}
	}
} satisfies Actions;
