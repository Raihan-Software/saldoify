import type { LayoutServerLoad } from '../$types';
import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// Skip auth check for auth routes (though they shouldn't be under dashboard)
	if (url.pathname.startsWith('/login') || 
		url.pathname.startsWith('/register') || 
		url.pathname.startsWith('/forgot-password') ||
		url.pathname.startsWith('/reset-password')) {
		return {};
	}
	
	// Get the session token from the correct cookie
	const sessionToken = cookies.get(auth.sessionCookieName);
	
	if (!sessionToken) {
		throw redirect(303, '/login');
	}
	
	// Validate the session token
	const { session, user } = await auth.validateSessionToken(sessionToken);
	
	if (!session) {
		throw redirect(303, '/login');
	}
	
	return {
		user
	};
};