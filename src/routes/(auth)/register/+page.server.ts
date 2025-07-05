import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
	confirmPassword: z.string(),
	terms: z.boolean({ required_error: 'You must agree to the terms' })
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
});

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			name: formData.get('name'),
			email: formData.get('email'),
			password: formData.get('password'),
			confirmPassword: formData.get('confirmPassword'),
			terms: formData.get('terms') === 'on'
		};

		try {
			const validated = registerSchema.parse(data);
			
			// TODO: Implement actual user registration logic here
			// For demo, we'll just redirect to login
			
			throw redirect(303, '/login?registered=true');
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path[0]) {
						errors[err.path[0].toString()] = err.message;
					}
				});
				
				return fail(400, {
					name: data.name as string,
					email: data.email as string,
					errors
				});
			}
			
			throw error;
		}
	}
} satisfies Actions;