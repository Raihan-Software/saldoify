// ***********************************************************
// This file is processed and loaded automatically before your test files.
// You can change the location of this file or turn off processing in 'supportFile'.
// ***********************************************************

// Import testing library commands
import '@testing-library/cypress/add-commands';

// Custom commands
Cypress.Commands.add('resetDatabase', () => {
	cy.task('resetDb');
});

// Type definitions for custom commands
declare global {
	namespace Cypress {
		interface Chainable {
			resetDatabase(): Chainable<void>;
		}
	}
}

// Prevent TypeScript from reading file as legacy script
export {};