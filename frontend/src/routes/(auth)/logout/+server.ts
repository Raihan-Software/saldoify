import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { sessionCookieName, invalidateSession } from '$lib/server/auth.js';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	// Invalidate session in database if session exists
	if (locals.session) {
		try {
			await invalidateSession(locals.session.id);
		} catch (error) {
			console.error('Error invalidating session:', error);
		}
	}
	
	// Delete the session cookie
	cookies.delete(sessionCookieName, { path: '/' });
	
	// Redirect to login page
	throw redirect(303, '/login');
};