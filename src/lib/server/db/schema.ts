import { pgTable, serial, integer, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';

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

// Asset types table
export const assetTypes = pgTable('asset_types', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	category: text('category').notNull(), // 'liquid', 'non_liquid', 'investment'
	label: text('label').notNull(),
	icon: text('icon').notNull(),
	isSystem: boolean('is_system').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Transaction categories table
export const transactionCategories = pgTable('transaction_categories', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: text('type').notNull(), // 'income', 'expense', 'transfer'
	label: text('label').notNull(),
	isSystem: boolean('is_system').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Assets table
export const assets = pgTable('assets', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	
	// Asset categorization
	type: text('type').notNull(), // 'liquid', 'non_liquid', 'investment'
	assetTypeId: text('asset_type_id').notNull().references(() => assetTypes.id),
	
	// Basic info
	name: text('name').notNull(),
	description: text('description'),
	
	// Financial data
	currentValue: decimal('current_value', { precision: 15, scale: 2 }).notNull(),
	purchaseValue: decimal('purchase_value', { precision: 15, scale: 2 }),
	purchaseDate: timestamp('purchase_date', { withTimezone: true, mode: 'date' }),
	
	// Additional fields based on type
	// For liquid assets
	accountNumber: text('account_number'),
	bankName: text('bank_name'),
	
	// For non-liquid assets
	location: text('location'),
	quantity: integer('quantity').default(1),
	
	// For investments
	ticker: text('ticker'),
	shares: decimal('shares', { precision: 12, scale: 4 }),
	
	// Metadata
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Transactions table
export const transactions = pgTable('transactions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	
	// Transaction details
	type: text('type').notNull(), // 'income', 'expense'
	categoryId: text('category_id').notNull().references(() => transactionCategories.id),
	description: text('description').notNull(),
	amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
	
	// Account association
	assetId: text('asset_id').notNull().references(() => assets.id), // The liquid asset account
	
	// Date and time
	transactionDate: timestamp('transaction_date', { withTimezone: true, mode: 'date' }).notNull(),
	
	// Additional info
	notes: text('notes'),
	
	// Metadata
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type PasswordResetToken = typeof passwordResetToken.$inferSelect;
export type Currency = typeof currencies.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type DebtType = typeof debtTypes.$inferSelect;
export type AssetType = typeof assetTypes.$inferSelect;
export type TransactionCategory = typeof transactionCategories.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
