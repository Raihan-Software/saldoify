import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
	email: z.string().email('Invalid email address')
});

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		// Validate input
		const result = forgotPasswordSchema.safeParse({ email });
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				email: email,
				errors: {
					email: errors.email?.[0]
				}
			});
		}

		// Mock forgot password - just return success
		// In a real app, you would send a reset email
		return {
			success: true,
			message: 'If an account with that email exists, we have sent a password reset link.'
		};
	}
} satisfies Actions;