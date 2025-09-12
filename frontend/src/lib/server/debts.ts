import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generate a debt ID
function generateDebtId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Get all debts for a user
export async function getUserDebts(userId: string) {
	const debts = await db
		.select({
			debt: table.debts,
			debtType: table.debtTypes
		})
		.from(table.debts)
		.leftJoin(table.debtTypes, eq(table.debts.debtTypeId, table.debtTypes.id))
		.where(eq(table.debts.userId, userId))
		.orderBy(desc(table.debts.balance));
	
	return debts.map(row => ({
		...row.debt,
		debtType: row.debtType
	}));
}

// Get a single debt
export async function getDebt(userId: string, debtId: string) {
	const [debt] = await db
		.select({
			debt: table.debts,
			debtType: table.debtTypes
		})
		.from(table.debts)
		.leftJoin(table.debtTypes, eq(table.debts.debtTypeId, table.debtTypes.id))
		.where(
			and(
				eq(table.debts.id, debtId),
				eq(table.debts.userId, userId)
			)
		)
		.limit(1);
	
	if (!debt) return null;
	
	return {
		...debt.debt,
		debtType: debt.debtType
	};
}

// Create a new debt
export async function createDebt(userId: string, data: {
	name: string;
	debtTypeId: string;
	balance: string;
	originalAmount?: string;
	interestRate?: string;
	monthlyPayment?: string;
	startDate?: Date;
	dueDate?: Date;
	notes?: string;
}) {
	const debtId = generateDebtId();
	
	const [debt] = await db
		.insert(table.debts)
		.values({
			id: debtId,
			userId,
			...data
		})
		.returning();
	
	return debt;
}

// Update a debt
export async function updateDebt(
	userId: string,
	debtId: string,
	data: Partial<{
		name: string;
		debtTypeId: string;
		balance: string;
		originalAmount: string;
		interestRate: string;
		monthlyPayment: string;
		startDate: Date;
		dueDate: Date;
		notes: string;
	}>
) {
	const updates: Partial<table.Debt> = {
		...data,
		updatedAt: new Date()
	};
	
	const [updated] = await db
		.update(table.debts)
		.set(updates)
		.where(
			and(
				eq(table.debts.id, debtId),
				eq(table.debts.userId, userId)
			)
		)
		.returning();
	
	return updated;
}

// Delete a debt
export async function deleteDebt(userId: string, debtId: string) {
	const [deleted] = await db
		.delete(table.debts)
		.where(
			and(
				eq(table.debts.id, debtId),
				eq(table.debts.userId, userId)
			)
		)
		.returning();
	
	return deleted;
}

// Get debt summary
export async function getDebtSummary(userId: string) {
	const debts = await getUserDebts(userId);
	
	const totalDebt = debts.reduce((sum, debt) => 
		sum + (parseFloat(debt.balance) || 0), 0
	);
	
	const totalMonthlyPayment = debts.reduce((sum, debt) => 
		sum + (parseFloat(debt.monthlyPayment || '0') || 0), 0
	);
	
	const totalOriginal = debts.reduce((sum, debt) => 
		sum + (parseFloat(debt.originalAmount || debt.balance) || 0), 0
	);
	
	const totalPaidOff = totalOriginal - totalDebt;
	const paidOffPercentage = totalOriginal > 0 ? (totalPaidOff / totalOriginal) * 100 : 0;
	
	const averageInterestRate = debts.length > 0
		? debts.reduce((sum, debt) => sum + (parseFloat(debt.interestRate || '0') || 0), 0) / 
		  debts.filter(d => d.interestRate).length || 0
		: 0;
	
	return {
		count: debts.length,
		totalDebt,
		totalMonthlyPayment,
		totalOriginal,
		totalPaidOff,
		paidOffPercentage,
		averageInterestRate
	};
}