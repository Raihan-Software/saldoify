# Authentication Test Cases - Saldoify

## Overview
This document outlines all test cases for the authentication system in Saldoify. The auth system uses session-based authentication with PostgreSQL storage, Argon2 password hashing, and 30-day session expiration.

## Test Scenarios

### 1. User Registration

#### 1.1 Successful Registration
- **Precondition**: User does not exist in database
- **Steps**:
  1. Navigate to `/register`
  2. Fill in valid email (test@example.com)
  3. Fill in name (Test User)
  4. Fill in username (testuser)
  5. Fill in password (Test123!@#)
  6. Submit form
- **Expected**: 
  - User created in database
  - Redirected to `/login`
  - Success message displayed

#### 1.2 Registration with Existing Email
- **Precondition**: User with email already exists
- **Steps**:
  1. Navigate to `/register`
  2. Use existing email
  3. Fill other fields with valid data
  4. Submit form
- **Expected**: 
  - Registration fails
  - Error message: "Email already exists"
  - Form data preserved (except password)

#### 1.3 Registration with Existing Username
- **Precondition**: User with username already exists
- **Steps**:
  1. Navigate to `/register`
  2. Use existing username
  3. Fill other fields with valid data
  4. Submit form
- **Expected**: 
  - Registration fails
  - Error message: "Username already exists"
  - Form data preserved (except password)

#### 1.4 Registration with Invalid Data
- **Test Cases**:
  - Empty email → "Email is required"
  - Invalid email format → "Invalid email format"
  - Empty name → "Name is required"
  - Empty username → "Username is required"
  - Username < 3 chars → "Username must be at least 3 characters"
  - Empty password → "Password is required"
  - Password < 8 chars → "Password must be at least 8 characters"

### 2. User Login

#### 2.1 Successful Login
- **Precondition**: Valid user exists
- **Steps**:
  1. Navigate to `/login`
  2. Enter valid email
  3. Enter valid password
  4. Submit form
- **Expected**:
  - Session created in database
  - Session cookie set
  - Redirected to `/dashboard`
  - User data available in app

#### 2.2 Login with Invalid Email
- **Steps**:
  1. Navigate to `/login`
  2. Enter non-existent email
  3. Enter any password
  4. Submit form
- **Expected**:
  - Login fails
  - Error message: "Invalid email or password"
  - No session created

#### 2.3 Login with Invalid Password
- **Steps**:
  1. Navigate to `/login`
  2. Enter valid email
  3. Enter wrong password
  4. Submit form
- **Expected**:
  - Login fails
  - Error message: "Invalid email or password"
  - No session created

#### 2.4 Login Form Validation
- **Test Cases**:
  - Empty email → "Email is required"
  - Invalid email format → "Invalid email format"
  - Empty password → "Password is required"

### 3. Password Reset

#### 3.1 Request Password Reset - Valid Email
- **Steps**:
  1. Navigate to `/forgot-password`
  2. Enter registered email
  3. Submit form
- **Expected**:
  - Reset token created in database
  - Email sent with reset link
  - Success message displayed
  - Token expires in 1 hour

#### 3.2 Request Password Reset - Invalid Email
- **Steps**:
  1. Navigate to `/forgot-password`
  2. Enter non-existent email
  3. Submit form
- **Expected**:
  - Success message displayed (security: don't reveal if email exists)
  - No email sent
  - No token created

#### 3.3 Reset Password with Valid Token
- **Precondition**: Valid reset token exists
- **Steps**:
  1. Click reset link from email
  2. Navigate to `/reset-password?token=valid-token`
  3. Enter new password
  4. Confirm new password
  5. Submit form
- **Expected**:
  - Password updated
  - Token deleted from database
  - Redirected to `/login`
  - Can login with new password

#### 3.4 Reset Password with Invalid Token
- **Steps**:
  1. Navigate to `/reset-password?token=invalid-token`
  2. Enter new password
  3. Submit form
- **Expected**:
  - Error message: "Invalid or expired reset token"
  - Password not changed

#### 3.5 Reset Password with Expired Token
- **Precondition**: Token older than 1 hour
- **Steps**:
  1. Use expired token URL
  2. Try to reset password
- **Expected**:
  - Error message: "Invalid or expired reset token"
  - Password not changed

### 4. Session Management

#### 4.1 Session Persistence
- **Steps**:
  1. Login successfully
  2. Close browser
  3. Reopen browser
  4. Navigate to protected route
- **Expected**:
  - Still logged in
  - Session valid
  - User data available

#### 4.2 Session Expiration (30 days)
- **Precondition**: Session older than 30 days
- **Steps**:
  1. Access protected route with expired session
- **Expected**:
  - Redirected to `/login`
  - Session removed from database
  - Must login again

#### 4.3 Session Auto-Renewal
- **Precondition**: Session < 15 days until expiry
- **Steps**:
  1. Access any protected route
- **Expected**:
  - Session expiry extended by 30 days
  - No user disruption
  - Updated in database

#### 4.4 Logout
- **Steps**:
  1. While logged in, click logout
  2. Confirm logout action
- **Expected**:
  - Session deleted from database
  - Session cookie cleared
  - Redirected to `/login`
  - Cannot access protected routes

### 5. Protected Route Access

#### 5.1 Access Protected Route - Authenticated
- **Precondition**: Valid session exists
- **Steps**:
  1. Navigate to any protected route (e.g., `/dashboard`, `/transactions`)
- **Expected**:
  - Page loads successfully
  - User data available
  - No redirect

#### 5.2 Access Protected Route - Not Authenticated
- **Steps**:
  1. Without logging in, navigate to protected route
- **Expected**:
  - Redirected to `/login`
  - After login, redirected back to requested page

#### 5.3 Access Auth Routes When Logged In
- **Precondition**: Already logged in
- **Steps**:
  1. Navigate to `/login` or `/register`
- **Expected**:
  - Redirected to `/dashboard`
  - Cannot access auth pages while logged in

### 6. Security Tests

#### 6.1 SQL Injection in Login
- **Steps**:
  1. Enter SQL injection attempts in email/password fields
  2. Examples: `' OR '1'='1`, `admin'--`, etc.
- **Expected**:
  - Login fails
  - No database errors
  - Normal error message

#### 6.2 Password Security
- **Tests**:
  - Passwords hashed with Argon2 in database
  - Raw passwords never logged
  - Password fields masked in UI
  - Passwords not included in form resubmission

#### 6.3 Session Security
- **Tests**:
  - Session tokens are cryptographically secure
  - Sessions tied to user ID
  - Old sessions cleaned up
  - HttpOnly cookie flag set

#### 6.4 CSRF Protection
- **Steps**:
  1. Attempt form submission without proper CSRF token
- **Expected**:
  - Request rejected
  - Error message displayed

### 7. Edge Cases

#### 7.1 Multiple Sessions
- **Steps**:
  1. Login from browser A
  2. Login from browser B with same account
- **Expected**:
  - Both sessions valid
  - Each browser maintains own session
  - Logout affects only current session

#### 7.2 Database Connection Lost
- **Precondition**: Database unavailable
- **Steps**:
  1. Attempt login/register
- **Expected**:
  - Graceful error handling
  - User-friendly error message
  - No stack traces exposed

#### 7.3 Concurrent Registration
- **Steps**:
  1. Start registration with same email in two browsers
  2. Submit both forms nearly simultaneously
- **Expected**:
  - Only one succeeds
  - Other gets "Email already exists" error
  - No database conflicts

## Test Data

### Valid Test Users
```
Email: test@example.com
Username: testuser
Password: Test123!@#

Email: admin@example.com  
Username: adminuser
Password: Admin123!@#
```

### Invalid Test Data
```
Emails: 
- notanemail
- @example.com
- test@
- test..user@example.com

Passwords:
- short (< 8 chars)
- 12345678 (too simple)
- password (common)
```

## Automation Notes

### E2E Test Setup
```javascript
// Reset database before auth tests
await db.delete(sessions).where(true);
await db.delete(users).where(true);

// Create test user helper
async function createTestUser() {
  return await createUser({
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    password: 'Test123!@#'
  });
}

// Login helper
async function loginUser(page, email, password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}
```

### Key Assertions
- Check URL changes after actions
- Verify cookie presence/absence
- Check for success/error messages
- Validate database state
- Ensure proper redirects

## Coverage Goals
- All happy paths: 100%
- Error cases: 100%
- Edge cases: 90%
- Security tests: 100%