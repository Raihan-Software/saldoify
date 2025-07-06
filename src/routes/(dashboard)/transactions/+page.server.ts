import type { PageServerLoad, Actions } from './$types';
import { getUserAssetsByType } from '$lib/server/assets';
import { getUserTransactionCategories } from '$lib/server/transaction-categories';
import { getUserTransactions, createTransaction, getMonthlyTransactionSummary } from '$lib/server/transactions';
import { fail } from '@sveltejs/kit';

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
		const type = data.get('type') as 'income' | 'expense';
		const categoryId = data.get('categoryId') as string;
		const description = data.get('description') as string;
		const amount = parseFloat(data.get('amount') as string);
		const assetId = data.get('assetId') as string;
		const transactionDate = new Date(data.get('transactionDate') as string);
		const notes = data.get('notes') as string;
		
		// Validate required fields
		if (!type || !categoryId || !description || !amount || !assetId || !transactionDate) {
			return fail(400, { message: 'Missing required fields' });
		}
		
		try {
			await createTransaction(locals.user.id, {
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
			console.error('Failed to create transaction:', error);
			return fail(500, { message: 'Failed to create transaction' });
		}
	}
} satisfies Actions;
