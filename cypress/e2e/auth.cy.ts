describe('User Authentication', () => {
	const email = 'testuser@example.com';
	const name = 'Test User';
	const password = '@TestPassword123!';
	const confirmPassword = '@TestPassword123!';

	before(() => {
		// Reset database before each test
		cy.resetDatabase();
	});

	// Register a new user

	it('should successfully register a new user', () => {
		// visit the register page
		cy.visit('/register');

		// Fill in the registration form
		cy.get('input[name="email"]').type(email);
		cy.get('input[name="name"]').type(name);
		cy.get('input[name="password"]').type(password);
		cy.get('input[name="confirmPassword"]').type(confirmPassword);
		cy.get('button#terms').click();

		// Submit the form
		cy.get('button[type="submit"]').click();

		// should redirect to dashboard
		cy.url().should('include', '/');
		
		// doesnt include register or login in the url
		cy.url().should('not.include', '/register');
		cy.url().should('not.include', '/login');
	});

	it('should show error when email already exists', () => {
		// visit the register page
		cy.visit('/register');

		// try to register with the same email
		cy.get('input[name="email"]').type(email);
		cy.get('input[name="name"]').type(name);
		cy.get('input[name="password"]').type(password);
		cy.get('input[name="confirmPassword"]').type(confirmPassword);
		cy.get('button#terms').click();
		cy.get('button[type="submit"]').click();

		// should show error message
		cy.contains('A user with this email already exists').should('be.visible');
	});

	it('should show error when password and confirm password do not match', () => {
		// visit the register page
		cy.visit('/register');

		// try to register with the same email
		cy.get('input[name="email"]').type(email);
		cy.get('input[name="name"]').type(name);
		cy.get('input[name="password"]').type(password);
		cy.get('input[name="confirmPassword"]').type(confirmPassword + '1');
		cy.get('button#terms').click();
		cy.get('button[type="submit"]').click();

		// should show error message
		cy.contains('Passwords do not match').should('be.visible');
	});

	// Login a user

	it('should successfully login with valid credentials', () => {
		// visit the login page
		cy.visit('/login');

		// Fill in the login form
		cy.get('input[name="email"]').type(email);
		cy.get('input[name="password"]').type(password);

		// Submit the form
		cy.get('button[type="submit"]').click();

		// should redirect to dashboard
		cy.url().should('include', '/');
		
		// doesnt include register or login in the url
		cy.url().should('not.include', '/register');
		cy.url().should('not.include', '/login');
	});

	it('should show error when password is incorrect', () => {
		// visit the login page
		cy.visit('/login');

		// Fill in the login form
		cy.get('input[name="email"]').type(email);
		cy.get('input[name="password"]').type(password + '1');

		// Submit the form
		cy.get('button[type="submit"]').click();

		// should show error message
		cy.contains('Invalid email or password').should('be.visible');
	});


	it('should show error when email is invalid', () => {
		// visit the login page
		cy.visit('/login');

		// Fill in the login form
		cy.get('input[name="email"]').type(email + '1');
		cy.get('input[name="password"]').type(password);

		// Submit the form
		cy.get('button[type="submit"]').click();

		// should show error message
		cy.contains('Invalid email address').should('be.visible');
	});	

	// log out a user

	it('should successfully log out a user', () => {
		// visit the login page
		cy.visit('/login');

		// Fill in the login form
		cy.get('input[name="email"]').type(email);
		cy.get('input[name="password"]').type(password);

		// Submit the form
		cy.get('button[type="submit"]').click();

		// should redirect to dashboard
		cy.url().should('include', '/');
		
		// click button with text "Sign Out" and click it
		cy.get('button').contains('Sign Out').click();

		// should redirect to login page
		cy.url().should('include', '/login');
		
		// doesnt include register or login in the url
		cy.url().should('not.include', '/register');
	});

	// reset password

	it('should successfully reset password', () => {
		// visit the login page
		cy.visit('/forgot-password');

		// fill in the email input
		cy.get('input[name="email"]').type(email);

		// click on the "Send Reset Link" button
		cy.get('button[type="submit"]').click();

		// should show success message
		cy.contains('sent password reset instructions').should('be.visible');
		
	});
});