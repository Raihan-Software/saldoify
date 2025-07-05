import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { createUser } from '$lib/server/user';
import * as auth from '$lib/server/auth';

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

		try {
			// Validate form data
			const validated = registerSchema.parse(data);
			
			// Create user in database
			const user = await createUser({
				email: validated.email,
				name: validated.name,
				password: validated.password
			});
			
			// Create session for the new user
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, user.id);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
			
			// Redirect to dashboard
			throw redirect(303, '/');
			
		} catch (error) {
			// Handle validation errors
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path[0]) {
						errors[err.path[0].toString()] = err.message;
					}
				});
				
				return fail(400, {
					data: {
						name: data.name,
						email: data.email
					},
					errors
				});
			}
			
			// Handle user creation errors
			if (error instanceof Error) {
				return fail(400, {
					data: {
						name: data.name,
						email: data.email
					},
					errors: {
						general: error.message
					}
				});
			}
			
			// Re-throw redirects
			throw error;
		}
	}
} satisfies Actions;