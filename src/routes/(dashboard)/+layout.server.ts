import type { LayoutServerLoad } from '../$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// Skip auth check for auth routes
	if (url.pathname.startsWith('/login') || 
		url.pathname.startsWith('/register') || 
		url.pathname.startsWith('/forgot-password') ||
		url.pathname.startsWith('/reset-password')) {
		return {};
	}
	
	// Check for session cookie
	const session = cookies.get('session');
	
	// For demo purposes, we'll allow access if there's any session cookie
	// In production, you would validate this session token
	if (!session) {
		throw redirect(303, '/login');
	}
	
	return {
		// You can return user data here if needed
		user: {
			email: 'demo@saldoify.com',
			name: 'Demo User'
		}
	};
};