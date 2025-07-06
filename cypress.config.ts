import { defineConfig } from 'cypress';
import { config as dotenvConfig } from 'dotenv';
import { resetTestDatabase } from './cypress/support/commands.js';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:5173',
		supportFile: 'cypress/support/e2e.ts',
		specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
		video: true,
		screenshotOnRunFailure: true,
		viewportWidth: 1280,
		viewportHeight: 720,
		defaultCommandTimeout: 10000,
		setupNodeEvents(on, config) {
			// Load environment variables from .env.test
			dotenvConfig({ path: '.env.test' });
			
			// Pass DATABASE_URL to tests
			config.env.DATABASE_URL = process.env.DATABASE_URL;
			
			// Task to reset database
			on('task', {
				async resetDb() {
					await resetTestDatabase();
					return null;
				}
			});
			
			return config;
		}
	}
});