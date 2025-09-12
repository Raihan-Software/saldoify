import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { sendPasswordResetEmail } from '$lib/server/email';
import { env } from '$env/dynamic/public';

const forgotPasswordSchema = z.object({
	email: z.string().email('Invalid email address')
});

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email');

		// Validate input
		const result = forgotPasswordSchema.safeParse({ email });
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				email: email?.toString() || '',
				errors: {
					email: errors.email?.[0]
				}
			});
		}

		// Find user by email
		const [user] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, result.data.email));

		// Always return success even if user doesn't exist (security best practice)
		if (!user) {
			return {
				success: true,
				email: result.data.email
			};
		}

		try {
			// Create password reset token
			const token = await auth.createPasswordResetToken(user.id, user.email);
			
			// Create reset URL
			const resetUrl = `${env.PUBLIC_APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
			
			// Send email
			await sendPasswordResetEmail(user.email, resetUrl);
			
			return {
				success: true,
				email: result.data.email
			};
		} catch (error) {
			console.error('Failed to send password reset email:', error);
			// Still return success to not leak user existence
			return {
				success: true,
				email: result.data.email
			};
		}
	}
} satisfies Actions;