import type { Handle } from '@sveltejs/kit';
import { validateSessionToken, sessionCookieName } from '$lib/server/auth.js';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Get session token from cookie
	const sessionToken = event.cookies.get(sessionCookieName);
	
	if (sessionToken) {
		try {
			// Validate session token
			const { session, user } = await validateSessionToken(sessionToken);
			
			if (session && user) {
				// Set user and session in locals
				event.locals.user = {
					id: user.id,
					email: user.email,
					name: user.name,
					username: user.username || undefined,
					createdAt: new Date(), // These would come from the backend in a real implementation
					updatedAt: new Date()
				};
				event.locals.session = {
					id: session.id,
					userId: session.userId,
					expiresAt: session.expiresAt
				};
			}
		} catch (error) {
			console.error('Session validation error:', error);
			// Clear invalid session cookie
			event.cookies.delete(sessionCookieName, { path: '/' });
		}
	}
	
	return resolve(event);
};

export const handle: Handle = handleAuth;