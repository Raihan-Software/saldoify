import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generate a transaction category ID
function generateTransactionCategoryId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Default transaction categories
export const defaultTransactionCategories = {
	income: [
		{ label: 'Salary' },
		{ label: 'Freelance' },
		{ label: 'Investment Income' },
		{ label: 'Business Income' },
		{ label: 'Rental Income' },
		{ label: 'Interest' },
		{ label: 'Dividends' },
		{ label: 'Gift' },
		{ label: 'Refund' },
		{ label: 'Other Income' }
	],
	expense: [
		{ label: 'Food & Dining' },
		{ label: 'Groceries' },
		{ label: 'Transportation' },
		{ label: 'Shopping' },
		{ label: 'Entertainment' },
		{ label: 'Bills & Utilities' },
		{ label: 'Healthcare' },
		{ label: 'Education' },
		{ label: 'Home' },
		{ label: 'Personal Care' },
		{ label: 'Gifts & Donations' },
		{ label: 'Insurance' },
		{ label: 'Taxes' },
		{ label: 'Other Expense' }
	],
	transfer: [
		{ label: 'Account Transfer' },
		{ label: 'Investment Transfer' },
		{ label: 'Loan Payment' },
		{ label: 'Credit Card Payment' },
		{ label: 'Family Transfer' },
		{ label: 'Savings Transfer' }
	]
};

// Create default transaction categories for a new user
export async function createDefaultTransactionCategories(userId: string) {
	const categoriesToCreate: any[] = [];
	
	for (const [type, categories] of Object.entries(defaultTransactionCategories)) {
		for (const category of categories) {
			categoriesToCreate.push({
				id: generateTransactionCategoryId(),
				userId,
				type,
				label: category.label,
				isSystem: true
			});
		}
	}
	
	try {
		await db.insert(table.transactionCategories).values(categoriesToCreate);
	} catch (error) {
		console.error('Failed to create default transaction categories:', error);
	}
}

// Get all transaction categories for a user
export async function getUserTransactionCategories(userId: string) {
	const categories = await db
		.select()
		.from(table.transactionCategories)
		.where(eq(table.transactionCategories.userId, userId))
		.orderBy(table.transactionCategories.type, table.transactionCategories.createdAt);
	
	// Group by type
	const grouped = {
		income: categories.filter(tc => tc.type === 'income'),
		expense: categories.filter(tc => tc.type === 'expense'),
		transfer: categories.filter(tc => tc.type === 'transfer')
	};
	
	return grouped;
}

// Create a new transaction category
export async function createTransactionCategory(userId: string, data: { type: string; label: string }) {
	const categoryId = generateTransactionCategoryId();
	
	const [category] = await db
		.insert(table.transactionCategories)
		.values({
			id: categoryId,
			userId,
			type: data.type,
			label: data.label,
			isSystem: false
		})
		.returning();
	
	return category;
}

// Update a transaction category
export async function updateTransactionCategory(
	userId: string,
	categoryId: string,
	data: { label?: string }
) {
	const updates: Partial<table.TransactionCategory> = {
		...data,
		updatedAt: new Date()
	};
	
	const [updated] = await db
		.update(table.transactionCategories)
		.set(updates)
		.where(
			and(
				eq(table.transactionCategories.id, categoryId),
				eq(table.transactionCategories.userId, userId)
			)
		)
		.returning();
	
	return updated;
}

// Delete a transaction category
export async function deleteTransactionCategory(userId: string, categoryId: string) {
	const [deleted] = await db
		.delete(table.transactionCategories)
		.where(
			and(
				eq(table.transactionCategories.id, categoryId),
				eq(table.transactionCategories.userId, userId),
				eq(table.transactionCategories.isSystem, false) // Can't delete system categories
			)
		)
		.returning();
	
	return deleted;
}