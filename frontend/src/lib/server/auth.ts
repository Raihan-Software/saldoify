import type { RequestEvent } from '@sveltejs/kit';
import { apiClient } from './api.js';

export const sessionCookieName = 'auth-session';

// Simple JWT token storage - in production, you might want to add JWT validation
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt?: Date) {
	// Set cookie to expire in 30 days if no expiration provided
	const cookieExpires = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
	
	event.cookies.set(sessionCookieName, token, {
		expires: cookieExpires,
		path: '/',
		httpOnly: true,
		secure: false, // Set to true in production with HTTPS
		sameSite: 'lax'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export async function validateSessionToken(token: string) {
	try {
		// Validate token by calling the backend API
		const user = await apiClient.getProfile(token);
		
		// Create a mock session object for compatibility
		const session = {
			id: 'jwt-session',
			userId: user.id,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
		};
		
		return { session, user };
	} catch (error) {
		console.error('Token validation error:', error);
		return { session: null, user: null };
	}
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

// For JWT-based auth, we don't need to invalidate sessions on the server
// The token will naturally expire
export async function invalidateSession(sessionId: string) {
	// No-op for JWT-based authentication
	// In a real implementation, you might want to maintain a blacklist
	console.log('Session invalidation requested for:', sessionId);
}
