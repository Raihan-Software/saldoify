import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	// Delete the session cookie
	cookies.delete('session', { path: '/' });
	
	// Redirect to login page
	throw redirect(303, '/login');
};