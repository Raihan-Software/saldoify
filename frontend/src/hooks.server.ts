import type { Handle } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Mock user for development - always set a user
	event.locals.user = {
		id: 'mock-user-123',
		email: 'demo@example.com',
		name: 'Demo User',
		username: 'demo',
		passwordHash: 'mock-hash',
		createdAt: new Date(),
		updatedAt: new Date()
	};
	event.locals.session = {
		id: 'mock-session-123',
		userId: 'mock-user-123',
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
	};
	
	return resolve(event);
};

export const handle: Handle = handleAuth;