import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getMockDebts, mockDebtTypes } from '$lib/mock-data';

export const load: PageServerLoad = async () => {
	return {
		debts: getMockDebts(),
		debtTypes: mockDebtTypes
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const debtTypeId = data.get('debtTypeId') as string;
		const balance = data.get('balance') as string;
		const originalAmount = data.get('originalAmount') as string;
		const interestRate = data.get('interestRate') as string;
		const monthlyPayment = data.get('monthlyPayment') as string;
		const startDate = data.get('startDate') ? new Date(data.get('startDate') as string) : undefined;
		const dueDate = data.get('dueDate') ? new Date(data.get('dueDate') as string) : undefined;
		const notes = data.get('notes') as string;
		
		// Validate required fields
		if (!name || !debtTypeId || !balance) {
			return fail(400, { message: 'Missing required fields' });
		}
		
		// Mock success response
		return { success: true };
	},
	
	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = data.get('name') as string;
		const debtTypeId = data.get('debtTypeId') as string;
		const balance = data.get('balance') as string;
		const originalAmount = data.get('originalAmount') as string;
		const interestRate = data.get('interestRate') as string;
		const monthlyPayment = data.get('monthlyPayment') as string;
		const startDate = data.get('startDate') ? new Date(data.get('startDate') as string) : undefined;
		const dueDate = data.get('dueDate') ? new Date(data.get('dueDate') as string) : undefined;
		const notes = data.get('notes') as string;
		
		// Validate required fields
		if (!id || !name || !debtTypeId || !balance) {
			return fail(400, { message: 'Missing required fields' });
		}
		
		// Mock success response
		return { success: true };
	},
	
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		
		if (!id) {
			return fail(400, { message: 'Missing debt ID' });
		}
		
		// Mock success response
		return { success: true };
	}
};