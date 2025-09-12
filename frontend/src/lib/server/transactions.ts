import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generate a transaction ID
function generateTransactionId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Get all transactions for a user
export async function getUserTransactions(userId: string) {
	const transactions = await db
		.select({
			id: table.transactions.id,
			type: table.transactions.type,
			description: table.transactions.description,
			amount: table.transactions.amount,
			transactionDate: table.transactions.transactionDate,
			notes: table.transactions.notes,
			category: {
				id: table.transactionCategories.id,
				label: table.transactionCategories.label
			},
			account: {
				id: table.assets.id,
				name: table.assets.name,
				bankName: table.assets.bankName
			}
		})
		.from(table.transactions)
		.leftJoin(
			table.transactionCategories,
			eq(table.transactions.categoryId, table.transactionCategories.id)
		)
		.leftJoin(
			table.assets,
			eq(table.transactions.assetId, table.assets.id)
		)
		.where(eq(table.transactions.userId, userId))
		.orderBy(desc(table.transactions.transactionDate));
	
	return transactions;
}

// Get transactions for a specific date range
export async function getUserTransactionsByDateRange(
	userId: string,
	startDate: Date,
	endDate: Date
) {
	const transactions = await db
		.select({
			id: table.transactions.id,
			type: table.transactions.type,
			description: table.transactions.description,
			amount: table.transactions.amount,
			transactionDate: table.transactions.transactionDate,
			notes: table.transactions.notes,
			category: {
				id: table.transactionCategories.id,
				label: table.transactionCategories.label
			},
			account: {
				id: table.assets.id,
				name: table.assets.name,
				bankName: table.assets.bankName
			}
		})
		.from(table.transactions)
		.leftJoin(
			table.transactionCategories,
			eq(table.transactions.categoryId, table.transactionCategories.id)
		)
		.leftJoin(
			table.assets,
			eq(table.transactions.assetId, table.assets.id)
		)
		.where(
			and(
				eq(table.transactions.userId, userId),
				gte(table.transactions.transactionDate, startDate),
				lte(table.transactions.transactionDate, endDate)
			)
		)
		.orderBy(desc(table.transactions.transactionDate));
	
	return transactions;
}

// Create a new transaction and update asset balance
export async function createTransaction(
	userId: string,
	data: {
		type: 'income' | 'expense';
		categoryId: string;
		description: string;
		amount: number;
		assetId: string;
		transactionDate: Date;
		notes?: string;
	}
) {
	const transactionId = generateTransactionId();
	
	// Start a database transaction
	return await db.transaction(async (tx) => {
		// Create the transaction
		const [transaction] = await tx
			.insert(table.transactions)
			.values({
				id: transactionId,
				userId,
				type: data.type,
				categoryId: data.categoryId,
				description: data.description,
				amount: data.amount.toString(),
				assetId: data.assetId,
				transactionDate: data.transactionDate,
				notes: data.notes
			})
			.returning();
		
		// Update the asset balance
		const asset = await tx
			.select()
			.from(table.assets)
			.where(eq(table.assets.id, data.assetId))
			.limit(1);
		
		if (!asset[0]) {
			throw new Error('Asset not found');
		}
		
		const currentValue = parseFloat(asset[0].currentValue);
		const transactionAmount = data.amount;
		
		// Calculate new balance
		const newBalance = data.type === 'income' 
			? currentValue + transactionAmount 
			: currentValue - transactionAmount;
		
		// Update asset balance
		await tx
			.update(table.assets)
			.set({
				currentValue: newBalance.toString(),
				updatedAt: new Date()
			})
			.where(eq(table.assets.id, data.assetId));
		
		return transaction;
	});
}

// Update a transaction
export async function updateTransaction(
	userId: string,
	transactionId: string,
	data: {
		type?: 'income' | 'expense';
		categoryId?: string;
		description?: string;
		amount?: number;
		assetId?: string;
		transactionDate?: Date;
		notes?: string;
	}
) {
	return await db.transaction(async (tx) => {
		// Get the original transaction
		const [originalTransaction] = await tx
			.select()
			.from(table.transactions)
			.where(
				and(
					eq(table.transactions.id, transactionId),
					eq(table.transactions.userId, userId)
				)
			)
			.limit(1);
		
		if (!originalTransaction) {
			throw new Error('Transaction not found');
		}
		
		// If amount or type is changing, we need to update asset balances
		if (data.amount !== undefined || data.type !== undefined || data.assetId !== undefined) {
			const oldAmount = parseFloat(originalTransaction.amount);
			const oldType = originalTransaction.type;
			const oldAssetId = originalTransaction.assetId;
			
			const newAmount = data.amount ?? oldAmount;
			const newType = data.type ?? oldType;
			const newAssetId = data.assetId ?? oldAssetId;
			
			// Revert the original transaction from the old asset
			const [oldAsset] = await tx
				.select()
				.from(table.assets)
				.where(eq(table.assets.id, oldAssetId))
				.limit(1);
			
			if (oldAsset) {
				const oldAssetValue = parseFloat(oldAsset.currentValue);
				const revertedValue = oldType === 'income' 
					? oldAssetValue - oldAmount 
					: oldAssetValue + oldAmount;
				
				await tx
					.update(table.assets)
					.set({
						currentValue: revertedValue.toString(),
						updatedAt: new Date()
					})
					.where(eq(table.assets.id, oldAssetId));
			}
			
			// Apply the new transaction to the new asset
			const [newAsset] = await tx
				.select()
				.from(table.assets)
				.where(eq(table.assets.id, newAssetId))
				.limit(1);
			
			if (newAsset) {
				const newAssetValue = parseFloat(newAsset.currentValue);
				const appliedValue = newType === 'income' 
					? newAssetValue + newAmount 
					: newAssetValue - newAmount;
				
				await tx
					.update(table.assets)
					.set({
						currentValue: appliedValue.toString(),
						updatedAt: new Date()
					})
					.where(eq(table.assets.id, newAssetId));
			}
		}
		
		// Update the transaction
		const updates: any = {
			...data,
			updatedAt: new Date()
		};
		
		if (data.amount !== undefined) {
			updates.amount = data.amount.toString();
		}
		
		const [updated] = await tx
			.update(table.transactions)
			.set(updates)
			.where(
				and(
					eq(table.transactions.id, transactionId),
					eq(table.transactions.userId, userId)
				)
			)
			.returning();
		
		return updated;
	});
}

// Delete a transaction
export async function deleteTransaction(userId: string, transactionId: string) {
	return await db.transaction(async (tx) => {
		// Get the transaction details first
		const [transaction] = await tx
			.select()
			.from(table.transactions)
			.where(
				and(
					eq(table.transactions.id, transactionId),
					eq(table.transactions.userId, userId)
				)
			)
			.limit(1);
		
		if (!transaction) {
			throw new Error('Transaction not found');
		}
		
		// Revert the transaction from the asset balance
		const [asset] = await tx
			.select()
			.from(table.assets)
			.where(eq(table.assets.id, transaction.assetId))
			.limit(1);
		
		if (asset) {
			const currentValue = parseFloat(asset.currentValue);
			const transactionAmount = parseFloat(transaction.amount);
			
			// Revert the balance
			const newBalance = transaction.type === 'income' 
				? currentValue - transactionAmount 
				: currentValue + transactionAmount;
			
			await tx
				.update(table.assets)
				.set({
					currentValue: newBalance.toString(),
					updatedAt: new Date()
				})
				.where(eq(table.assets.id, transaction.assetId));
		}
		
		// Delete the transaction
		const [deleted] = await tx
			.delete(table.transactions)
			.where(
				and(
					eq(table.transactions.id, transactionId),
					eq(table.transactions.userId, userId)
				)
			)
			.returning();
		
		return deleted;
	});
}

// Get monthly summary
// exclude transfers from the summary
export async function getMonthlyTransactionSummary(userId: string, year: number, month: number) {
	const startDate = new Date(year, month - 1, 1);
	const endDate = new Date(year, month, 0, 23, 59, 59, 999);
	
	const result = await db
		.select({
			type: table.transactions.type,
			total: sql<string>`sum(${table.transactions.amount})::numeric`
		})
		.from(table.transactions)
		.leftJoin(
			table.transactionCategories,
			eq(table.transactions.categoryId, table.transactionCategories.id)
		)
		.where(
			and(
				eq(table.transactions.userId, userId),
				gte(table.transactions.transactionDate, startDate),
				lte(table.transactions.transactionDate, endDate),
				sql`${table.transactionCategories.type} != 'transfer'`
			)
		)
		.groupBy(table.transactions.type);
	
	const summary = {
		income: 0,
		expense: 0
	};
	
	result.forEach(row => {
		if (row.type === 'income') {
			summary.income = parseFloat(row.total || '0');
		} else if (row.type === 'expense') {
			summary.expense = parseFloat(row.total || '0');
		}
	});
	
	return summary;
}