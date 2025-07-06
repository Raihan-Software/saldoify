// Database reset helper
export async function resetTestDatabase() {
	// This will be called from Node context in cypress.config.ts
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const postgres = (await import('postgres')).default;
	const schema = await import('../../src/lib/server/db/schema');
	
	// Use test database URL
	const connectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL_TEST not configured');
	}
	
	const client = postgres(connectionString);
	const db = drizzle(client, { schema });
	
	try {
		// Clear tables in correct order (respecting foreign keys)
		// First delete dependent tables
		await db.delete(schema.session).execute();
		await db.delete(schema.transactions).execute();
		await db.delete(schema.debts).execute();
		await db.delete(schema.assets).execute();
		
		// Then delete reference tables
		await db.delete(schema.debtTypes).execute();
		await db.delete(schema.assetTypes).execute();
		await db.delete(schema.transactionCategories).execute();
		await db.delete(schema.userPreferences).execute();
		
		// Finally delete users
		await db.delete(schema.user).execute();
		
		console.log('Test database reset successfully');
	} catch (error) {
		console.error('Error resetting database:', error);
		throw error;
	} finally {
		await client.end();
	}
}