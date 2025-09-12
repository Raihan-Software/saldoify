import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';

const resetPasswordSchema = z.object({
	password: z.string().min(8, 'Password must be at least 8 characters'),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"]
});

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	
	if (!token) {
		return {
			error: 'invalid_token'
		};
	}
	
	// Validate token
	const { valid } = await auth.validatePasswordResetToken(token);
	
	if (!valid) {
		return {
			error: 'invalid_token'
		};
	}
	
	return {};
};

export const actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');
		const token = url.searchParams.get('token');
		
		if (!token) {
			return fail(400, {
				error: 'invalid_token'
			});
		}
		
		// Validate token again
		const { valid, token: resetToken } = await auth.validatePasswordResetToken(token);
		
		if (!valid || !resetToken) {
			return fail(400, {
				error: 'invalid_token'
			});
		}
		
		// Validate input
		const result = resetPasswordSchema.safeParse({ password, confirmPassword });
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors: {
					password: errors.password?.[0],
					confirmPassword: errors.confirmPassword?.[0]
				}
			});
		}
		
		try {
			// Hash the new password
			const passwordHash = await hash(result.data.password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});
			
			// Update user password
			await db
				.update(table.user)
				.set({ 
					passwordHash,
					updatedAt: new Date()
				})
				.where(eq(table.user.id, resetToken.userId));
			
			// Delete the reset token
			await auth.deletePasswordResetToken(token);
			
			// Invalidate all existing sessions for this user (security measure)
			await db
				.delete(table.session)
				.where(eq(table.session.userId, resetToken.userId));
			
			return {
				success: true
			};
		} catch (error) {
			console.error('Failed to reset password:', error);
			return fail(500, {
				errors: {
					general: 'Failed to reset password. Please try again.'
				}
			});
		}
	}
} satisfies Actions;