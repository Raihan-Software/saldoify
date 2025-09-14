import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const resetPasswordSchema = z.object({
	password: z.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
});

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	
	if (!token) {
		throw redirect(303, '/forgot-password');
	}
	
	return { token };
};

export const actions = {
	default: async ({ request, url }) => {
		const token = url.searchParams.get('token');
		
		if (!token) {
			throw redirect(303, '/forgot-password');
		}
		
		const formData = await request.formData();
		const data = {
			password: formData.get('password') as string,
			confirmPassword: formData.get('confirmPassword') as string
		};

		// Validate input
		const result = resetPasswordSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors: {
					password: errors.password?.[0],
					confirmPassword: errors.confirmPassword?.[0]
				}
			});
		}

		// Mock password reset - just redirect to login
		// In a real app, you would validate the token and update the password
		throw redirect(303, '/login?message=Password reset successful. Please log in.');
	}
} satisfies Actions;