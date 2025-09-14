import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { apiClient } from '$lib/server/api';
import { setSessionTokenCookie } from '$lib/server/auth.js';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to dashboard
	if (locals.user) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		// Validate input
		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				email: email?.toString() || '',
				errors: {
					email: errors.email?.[0],
					password: errors.password?.[0]
				}
			});
		}

		try {
			// Call backend API to authenticate user
			const loginResponse = await apiClient.login({
				email: result.data.email,
				password: result.data.password
			});

			// Set JWT token as session cookie
			setSessionTokenCookie(
				{ cookies } as any,
				loginResponse.token
			);

			// Redirect to dashboard
			throw redirect(303, '/');
		} catch (error) {
			// Check if this is a redirect (which is expected behavior)
			if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
				// This is a redirect, re-throw it
				throw error;
			}
			
			console.error('Login error:', error);
			
			let errorMessage = 'Login failed';
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			
			return fail(400, {
				email: result.data.email,
				errors: {
					general: errorMessage
				}
			});
		}
	}
} satisfies Actions;