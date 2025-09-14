import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async () => {
	// Mock user for development
	const user = {
		id: 'mock-user-123',
		email: 'demo@example.com',
		name: 'Demo User',
		username: 'demo',
		passwordHash: 'mock-hash',
		createdAt: new Date(),
		updatedAt: new Date()
	};
	
	return {
		user
	};
};