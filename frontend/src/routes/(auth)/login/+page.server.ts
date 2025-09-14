import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

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
	default: async ({ request }) => {
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

		// Mock login - accept any email/password combination
		// In a real app, you would validate against a database
		if (result.data.email && result.data.password) {
			// Redirect to dashboard
			throw redirect(303, '/');
		}

		return fail(400, {
			email: result.data.email,
			errors: {
				general: 'Invalid email or password'
			}
		});
	}
} satisfies Actions;