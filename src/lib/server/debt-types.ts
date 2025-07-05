import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generate a debt type ID
function generateDebtTypeId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Default debt types
export const defaultDebtTypes = [
	{ label: 'Credit Card', icon: '💳' },
	{ label: 'Personal Loan', icon: '💰' },
	{ label: 'Mortgage', icon: '🏠' },
	{ label: 'Auto Loan', icon: '🚗' },
	{ label: 'Student Loan', icon: '🎓' },
	{ label: 'Business Loan', icon: '🏢' },
	{ label: 'Medical Debt', icon: '🏥' },
	{ label: 'Other', icon: '📄' }
];

// Create default debt types for a new user
export async function createDefaultDebtTypes(userId: string) {
	const debtTypesToCreate = defaultDebtTypes.map(type => ({
		id: generateDebtTypeId(),
		userId,
		label: type.label,
		icon: type.icon,
		isSystem: true
	}));
	
	try {
		await db.insert(table.debtTypes).values(debtTypesToCreate);
	} catch (error) {
		console.error('Failed to create default debt types:', error);
		// Non-critical error, user can still add custom types
	}
}

// Get all debt types for a user
export async function getUserDebtTypes(userId: string) {
	const debtTypes = await db
		.select()
		.from(table.debtTypes)
		.where(eq(table.debtTypes.userId, userId))
		.orderBy(table.debtTypes.createdAt);
	
	return debtTypes;
}

// Create a new debt type
export async function createDebtType(userId: string, data: { label: string; icon: string }) {
	const debtTypeId = generateDebtTypeId();
	
	const [debtType] = await db
		.insert(table.debtTypes)
		.values({
			id: debtTypeId,
			userId,
			label: data.label,
			icon: data.icon,
			isSystem: false
		})
		.returning();
	
	return debtType;
}

// Update a debt type
export async function updateDebtType(
	userId: string,
	debtTypeId: string,
	data: { label?: string; icon?: string }
) {
	const updates: Partial<table.DebtType> = {
		...data,
		updatedAt: new Date()
	};
	
	const [updated] = await db
		.update(table.debtTypes)
		.set(updates)
		.where(
			and(
				eq(table.debtTypes.id, debtTypeId),
				eq(table.debtTypes.userId, userId)
			)
		)
		.returning();
	
	return updated;
}

// Delete a debt type
export async function deleteDebtType(userId: string, debtTypeId: string) {
	const [deleted] = await db
		.delete(table.debtTypes)
		.where(
			and(
				eq(table.debtTypes.id, debtTypeId),
				eq(table.debtTypes.userId, userId),
				eq(table.debtTypes.isSystem, false) // Can't delete system types
			)
		)
		.returning();
	
	return deleted;
}