import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	remember: z.boolean().optional()
});

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const data = {
			email: formData.get('email'),
			password: formData.get('password'),
			remember: formData.get('remember') === 'on'
		};

		try {
			const validated = loginSchema.parse(data);
			
			// TODO: Implement actual authentication logic here
			// For demo, we'll just check if email/password match demo credentials
			if (validated.email === 'demo@saldoify.com' && validated.password === 'password123') {
				// Set a demo session cookie
				cookies.set('session', 'demo-session-token', {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					maxAge: validated.remember ? 60 * 60 * 24 * 30 : 0 // 30 days if remember me
				});
				
				throw redirect(303, '/');
			}
			
			return fail(400, {
				email: validated.email,
				error: 'Invalid email or password'
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path[0]) {
						errors[err.path[0].toString()] = err.message;
					}
				});
				
				return fail(400, {
					email: data.email as string,
					errors
				});
			}
			
			throw error;
		}
	}
} satisfies Actions;