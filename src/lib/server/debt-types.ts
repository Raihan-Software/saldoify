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
const defaultDebtTypes = [
	{ label: 'Mortgage', icon: '🏠' },
	{ label: 'Auto Loan', icon: '🚗' },
	{ label: 'Credit Card', icon: '💳' },
	{ label: 'Personal Loan', icon: '💸' },
	{ label: 'Student Loan', icon: '🎓' },
	{ label: 'Business Loan', icon: '💼' },
	{ label: 'Medical Debt', icon: '🏥' },
	{ label: 'Other', icon: '📄' }
];

// Initialize default debt types for a user
export async function initializeUserDebtTypes(userId: string) {
	const debtTypes = defaultDebtTypes.map(type => ({
		id: generateDebtTypeId(),
		userId,
		label: type.label,
		icon: type.icon,
		isSystem: true
	}));
	
	await db.insert(table.debtTypes).values(debtTypes);
	return debtTypes;
}

// Get all debt types for a user
export async function getUserDebtTypes(userId: string) {
	const debtTypes = await db
		.select()
		.from(table.debtTypes)
		.where(eq(table.debtTypes.userId, userId));
	
	// Initialize default types if user has none
	if (debtTypes.length === 0) {
		return await initializeUserDebtTypes(userId);
	}
	
	return debtTypes;
}

// Create a custom debt type
export async function createDebtType(userId: string, data: {
	label: string;
	icon: string;
}) {
	const id = generateDebtTypeId();
	
	const [debtType] = await db
		.insert(table.debtTypes)
		.values({
			id,
			userId,
			...data,
			isSystem: false
		})
		.returning();
	
	return debtType;
}

// Update a debt type (only non-system types)
export async function updateDebtType(
	userId: string,
	debtTypeId: string,
	data: {
		label?: string;
		icon?: string;
	}
) {
	const [updated] = await db
		.update(table.debtTypes)
		.set({
			...data,
			updatedAt: new Date()
		})
		.where(
			and(
				eq(table.debtTypes.id, debtTypeId),
				eq(table.debtTypes.userId, userId),
				eq(table.debtTypes.isSystem, false)
			)
		)
		.returning();
	
	return updated;
}

// Delete a debt type (only non-system types)
export async function deleteDebtType(userId: string, debtTypeId: string) {
	// Check if any debts are using this type
	const [debtUsingType] = await db
		.select()
		.from(table.debts)
		.where(
			and(
				eq(table.debts.userId, userId),
				eq(table.debts.debtTypeId, debtTypeId)
			)
		)
		.limit(1);
	
	if (debtUsingType) {
		throw new Error('Cannot delete debt type that is in use');
	}
	
	const [deleted] = await db
		.delete(table.debtTypes)
		.where(
			and(
				eq(table.debtTypes.id, debtTypeId),
				eq(table.debtTypes.userId, userId),
				eq(table.debtTypes.isSystem, false)
			)
		)
		.returning();
	
	return deleted;
}