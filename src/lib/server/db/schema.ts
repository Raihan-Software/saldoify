import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	username: text('username').unique(), // Made optional for backward compatibility
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const passwordResetToken = pgTable('password_reset_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	email: text('email').notNull(),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const currencies = pgTable('currencies', {
	code: text('code').primaryKey(), // ISO 4217 code
	name: text('name').notNull(),
	symbol: text('symbol').notNull(),
	decimalPlaces: integer('decimal_places').notNull().default(2),
	isActive: boolean('is_active').notNull().default(true)
});

export const userPreferences = pgTable('user_preferences', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	
	// Currency settings (from General Settings tab)
	currencyCode: text('currency_code').notNull().default('IDR'), // Default Currency dropdown
	currencyDisplay: text('currency_display').notNull().default('symbol'), // 'symbol', 'code', 'both'
	
	// Display preferences (from General Settings tab)
	numberFormat: text('number_format').notNull().default('1.234.567,89'), // Number Format dropdown
	compactNumbers: boolean('compact_numbers').notNull().default(false), // Compact Numbers toggle
	
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Debt types table
export const debtTypes = pgTable('debt_types', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	label: text('label').notNull(),
	icon: text('icon').notNull(),
	isSystem: boolean('is_system').notNull().default(false), // For default types
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type PasswordResetToken = typeof passwordResetToken.$inferSelect;
export type Currency = typeof currencies.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type DebtType = typeof debtTypes.$inferSelect;
