import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createDefaultPreferences } from './preferences';
import { createDefaultDebtTypes } from './debt-types';

// Generate a user ID with 120 bits of entropy
export function generateUserId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Hash password using Argon2id
export async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		// Recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

export interface CreateUserInput {
	email: string;
	name: string;
	password: string;
}

export async function createUser(input: CreateUserInput) {
	const { email, name, password } = input;
	
	// Check if user already exists
	const existingUser = await db
		.select()
		.from(table.user)
		.where(eq(table.user.email, email.toLowerCase()))
		.limit(1);
	
	if (existingUser.length > 0) {
		throw new Error('A user with this email already exists');
	}
	
	// Generate user ID and hash password
	const userId = generateUserId();
	const passwordHash = await hashPassword(password);
	
	// Create user
	try {
		const [newUser] = await db
			.insert(table.user)
			.values({
				id: userId,
				email: email.toLowerCase(),
				name: name.trim(),
				passwordHash,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();
		
		// Create default preferences for the new user
		await createDefaultPreferences(newUser.id);
		
		// Create default debt types for the new user
		await createDefaultDebtTypes(newUser.id);
		
		return {
			id: newUser.id,
			email: newUser.email,
			name: newUser.name
		};
	} catch (error) {
		// Handle unique constraint violation
		if (error instanceof Error && error.message.includes('unique')) {
			throw new Error('A user with this email already exists');
		}
		throw error;
	}
}

export async function getUserByEmail(email: string) {
	const [user] = await db
		.select()
		.from(table.user)
		.where(eq(table.user.email, email.toLowerCase()))
		.limit(1);
	
	return user || null;
}