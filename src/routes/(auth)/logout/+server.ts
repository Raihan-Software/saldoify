import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	// Get the session token
	const sessionToken = cookies.get(auth.sessionCookieName);
	
	if (sessionToken) {
		// Validate and get the session to invalidate it in the database
		const { session } = await auth.validateSessionToken(sessionToken);
		
		if (session) {
			// Invalidate the session in the database
			await auth.invalidateSession(session.id);
		}
	}
	
	// Delete the session cookie
	auth.deleteSessionTokenCookie({ cookies } as any);
	
	// Redirect to login page
	throw redirect(303, '/login');
};