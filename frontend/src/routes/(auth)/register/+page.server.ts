import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(100),
	email: z.string().email('Invalid email address'),
	password: z.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
	confirmPassword: z.string(),
	terms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) })
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
});

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const data = {
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			confirmPassword: formData.get('confirmPassword') as string,
			terms: formData.get('terms') === 'on'
		};

		// Validate input
		const result = registerSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				name: data.name,
				email: data.email,
				errors: {
					name: errors.name?.[0],
					email: errors.email?.[0],
					password: errors.password?.[0],
					confirmPassword: errors.confirmPassword?.[0],
					terms: errors.terms?.[0]
				}
			});
		}

		// Mock registration - just redirect to login
		// In a real app, you would create the user in the database
		throw redirect(303, '/login?message=Registration successful. Please log in.');
	}
} satisfies Actions;