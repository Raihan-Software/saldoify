import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getUserDebts, createDebt, updateDebt, deleteDebt } from '$lib/server/debts';
import { getUserDebtTypes } from '$lib/server/debt-types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const [debts, debtTypes] = await Promise.all([
		getUserDebts(locals.user.id),
		getUserDebtTypes(locals.user.id)
	]);

	return {
		debts,
		debtTypes
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const debtTypeId = formData.get('debtTypeId') as string;
		const balance = formData.get('balance') as string;
		const originalAmount = formData.get('originalAmount') as string | null;
		const interestRate = formData.get('interestRate') as string | null;
		const monthlyPayment = formData.get('monthlyPayment') as string | null;
		const startDate = formData.get('startDate') as string | null;
		const dueDate = formData.get('dueDate') as string | null;
		const notes = formData.get('notes') as string | null;

		// Validate required fields
		if (!name || !debtTypeId || !balance) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			await createDebt(locals.user.id, {
				name,
				debtTypeId,
				balance,
				originalAmount: originalAmount || undefined,
				interestRate: interestRate || undefined,
				monthlyPayment: monthlyPayment || undefined,
				startDate: startDate ? new Date(startDate) : undefined,
				dueDate: dueDate ? new Date(dueDate) : undefined,
				notes: notes || undefined
			});

			return { success: true };
		} catch (error) {
			console.error('Error creating debt:', error);
			return fail(500, { message: 'Failed to create debt' });
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string | null;
		const debtTypeId = formData.get('debtTypeId') as string | null;
		const balance = formData.get('balance') as string | null;
		const originalAmount = formData.get('originalAmount') as string | null;
		const interestRate = formData.get('interestRate') as string | null;
		const monthlyPayment = formData.get('monthlyPayment') as string | null;
		const startDate = formData.get('startDate') as string | null;
		const dueDate = formData.get('dueDate') as string | null;
		const notes = formData.get('notes') as string | null;

		if (!id) {
			return fail(400, { message: 'Debt ID is required' });
		}

		try {
			const updates: any = {};
			if (name) updates.name = name;
			if (debtTypeId) updates.debtTypeId = debtTypeId;
			if (balance) updates.balance = balance;
			if (originalAmount !== null) updates.originalAmount = originalAmount || null;
			if (interestRate !== null) updates.interestRate = interestRate || null;
			if (monthlyPayment !== null) updates.monthlyPayment = monthlyPayment || null;
			if (startDate !== null) updates.startDate = startDate ? new Date(startDate) : null;
			if (dueDate !== null) updates.dueDate = dueDate ? new Date(dueDate) : null;
			if (notes !== null) updates.notes = notes || null;

			await updateDebt(locals.user.id, id, updates);

			return { success: true };
		} catch (error) {
			console.error('Error updating debt:', error);
			return fail(500, { message: 'Failed to update debt' });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'Debt ID is required' });
		}

		try {
			await deleteDebt(locals.user.id, id);
			return { success: true };
		} catch (error) {
			console.error('Error deleting debt:', error);
			return fail(500, { message: 'Failed to delete debt' });
		}
	}
};