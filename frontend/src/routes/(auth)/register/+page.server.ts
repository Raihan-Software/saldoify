import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { apiClient } from '$lib/server/api';
// No auth imports needed for registration

const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(100),
	email: z.string().email('Invalid email address'),
	password: z.string()
		.min(6, 'Password must be at least 6 characters'),
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

		try {
			// Call backend API to register user
			const registerResponse = await apiClient.register({
				email: result.data.email,
				name: result.data.name,
				password: result.data.password
			});

			// After registration, we need to login to get a JWT token
			// For now, redirect to login page with success message
			throw redirect(303, '/login?message=Registration successful. Please log in.');
		} catch (error) {
			// Check if this is a redirect (which is expected behavior)
			if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
				// This is a redirect, re-throw it
				throw error;
			}
			
			console.error('Registration error:', error);
			return fail(400, {
				name: data.name,
				email: data.email,
				errors: {
					general: error instanceof Error ? error.message : 'Registration failed'
				}
			});
		}
	}
} satisfies Actions;