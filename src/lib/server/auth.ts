import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase, encodeBase32LowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

function generateId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: { 
				id: table.user.id, 
				email: table.user.email,
				name: table.user.name,
				username: table.user.username 
			},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
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

// Password reset token functions
export function generatePasswordResetToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createPasswordResetToken(userId: string, email: string) {
	// Delete any existing tokens for this user
	await db.delete(table.passwordResetToken).where(eq(table.passwordResetToken.userId, userId));
	
	const token = generatePasswordResetToken();
	const tokenId = generateId();
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
	
	await db.insert(table.passwordResetToken).values({
		id: tokenId,
		userId,
		email,
		token,
		expiresAt
	});
	
	return token;
}

export async function validatePasswordResetToken(token: string) {
	const [resetToken] = await db
		.select()
		.from(table.passwordResetToken)
		.where(eq(table.passwordResetToken.token, token));
	
	if (!resetToken) {
		return { valid: false, token: null };
	}
	
	// Check if token is expired
	if (Date.now() >= resetToken.expiresAt.getTime()) {
		await db.delete(table.passwordResetToken).where(eq(table.passwordResetToken.id, resetToken.id));
		return { valid: false, token: null };
	}
	
	return { valid: true, token: resetToken };
}

export async function deletePasswordResetToken(token: string) {
	await db.delete(table.passwordResetToken).where(eq(table.passwordResetToken.token, token));
}
