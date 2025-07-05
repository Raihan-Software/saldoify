import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';

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

		// Find user by email
		const [user] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, result.data.email));

		if (!user) {
			return fail(400, {
				email: result.data.email,
				errors: {
					general: 'Invalid email or password'
				}
			});
		}

		// Verify password
		const isValidPassword = await verify(user.passwordHash, result.data.password);
		if (!isValidPassword) {
			return fail(400, {
				email: result.data.email,
				errors: {
					general: 'Invalid email or password'
				}
			});
		}

		// Create session
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, user.id);
		auth.setSessionTokenCookie({ cookies } as any, sessionToken, session.expiresAt);

		// Redirect to dashboard
		throw redirect(303, '/');
	}
} satisfies Actions;