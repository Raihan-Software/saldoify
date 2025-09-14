import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	// Mock logout - just delete the session cookie
	cookies.delete('auth-session', { path: '/' });
	
	// Redirect to login page
	throw redirect(303, '/login');
};