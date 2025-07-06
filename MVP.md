# Saldoify MVP Plan

## Overview
The Minimum Viable Product (MVP) focuses on delivering core financial tracking functionality with a solid foundation for future expansion. The MVP includes authentication, asset management, transaction tracking, and net worth calculation.

## MVP Scope

### Core Modules

#### 1. Authentication & User Management
**Purpose**: Secure user access and data isolation

**Features**:
- [x] User registration with email 
- [x] Secure login with session management
- [x] Password reset functionality
- [x] User profile management
- [x] Session expiry and renewal

**Technical Requirements**:
- Argon2 password hashing
- Session tokens with 30-day expiry
- Automatic session renewal
- CSRF protection
- Rate limiting on auth endpoints

**Database Schema**:
```sql
- users (id, email, username, password_hash, created_at, updated_at)
- sessions (id, user_id, token, expires_at, created_at)
- password_reset_tokens (id, user_id, token, expires_at, used)
```

#### 2. Assets Management
**Purpose**: Track all user assets in one place

**Features**:
- [x] **Liquid Assets**
  - Cash on hand
  - Savings accounts
  - Checking accounts
  - E-wallets (GoPay, OVO, etc.)
  
- [x] **Investment Assets**
  - Stocks
  - Mutual funds
  - Bonds
  - Fixed deposits
  
- [x] **Non-Liquid Assets**
  - Real estate
  - Vehicles
  - Equipment
  - Other valuable items

**Core Functionality**:
- [x] CRUD operations for all asset types
- [x] Asset categorization
- [x] Current value tracking
- [x] Purchase price and date recording
- [x] Notes and documentation
- [x] Multi-currency support (IDR primary)

**Database Schema**:
```sql
- assets (id, user_id, name, type, category, purchase_price, current_value, currency, purchase_date, notes, created_at, updated_at)
- asset_values_history (id, asset_id, value, recorded_at)
```

#### 3. Transaction Management
**Purpose**: Record and categorize all financial transactions

**Features**:
- [x] **Transaction Types**
  - Income transactions
  - Expense transactions
  - Transfer between accounts
  
- [x] **Transaction Details**
  - Amount and currency
  - Date and time
  - Category and subcategory
  - notes

**Core Functionality**:
- [x] Quick transaction entry
- [x] Monthly summaries

**Database Schema**:
```sql
- transactions (id, user_id, type, amount, currency, date, category_id, account_id, description, tags, is_recurring, created_at, updated_at)
- categories (id, user_id, name, type, parent_id, icon, color)
- accounts (id, user_id, name, type, balance, currency)
```

#### 4. Net Worth Calculation
**Purpose**: Provide real-time net worth tracking and visualization

**Features**:
- [ ] **Net Worth Dashboard**
  - Total assets value
  - Total liabilities value (Phase 2)
  - Net worth calculation
  - Month-over-month changes
  - Asset allocation breakdown

- [ ] **Visualizations**
  - Net worth trend chart
  - Asset distribution pie chart
  - Category-wise breakdown
  - Currency exposure (if multi-currency)

**Core Functionality**:
- [ ] Automatic calculation on data changes
- [ ] Historical net worth tracking
- [ ] Export net worth reports
- [ ] Customizable calculation rules

## Technical Implementation

### Frontend Architecture
- **Framework**: SvelteKit with Svelte 5
- **Styling**: TailwindCSS v4
- **Components**: Shadcn-svelte for UI consistency
- **State Management**: Svelte stores for global state
- **Forms**: Superforms for validation
- **Charts**: Chart.js or D3.js for visualizations

### Backend Architecture
- **API**: SvelteKit server-side endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom session-based auth
- **Validation**: Zod schemas
- **Error Handling**: Consistent error responses

### Testing Strategy

#### Unit Tests
- [ ] Authentication functions
- [ ] Net worth calculations
- [ ] Currency conversion logic
- [ ] Date/time utilities
- [ ] Validation schemas

#### Integration Tests
- [ ] API endpoint testing
- [ ] Database operations
- [ ] Authentication flows
- [ ] Transaction workflows
- [ ] Asset management flows

#### E2E Tests
- [ ] User registration and login
- [ ] Complete asset creation flow
- [ ] Transaction entry and categorization
- [ ] Net worth dashboard interactions
- [ ] Data export functionality

### Security Measures
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Secure session management
- [ ] HTTPS enforcement
- [ ] Security headers

## MVP Milestones

### Milestone 1: Foundation
- [ ] Project setup and configuration
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic UI layout and navigation
- [ ] Testing infrastructure setup

### Milestone 2: Asset Management
- [ ] Asset CRUD operations
- [ ] Asset categorization UI
- [ ] Asset value history tracking
- [ ] Asset list and detail views
- [ ] Asset-related tests

### Milestone 3: Transaction System
- [ ] Transaction CRUD operations
- [ ] Category management
- [ ] Transaction filters and search
- [ ] Recurring transactions
- [ ] Transaction-related tests

### Milestone 4: Net Worth & Analytics
- [ ] Net worth calculation engine
- [ ] Dashboard implementation
- [ ] Charts and visualizations
- [ ] Report generation
- [ ] Analytics-related tests

### Milestone 5: Polish & Launch
- [ ] Performance optimization
- [ ] Security audit
- [ ] User documentation
- [ ] Deployment setup
- [ ] Beta testing

## Definition of Done

### Feature Completion Criteria
- [ ] Feature fully implemented and working
- [ ] Unit tests written and passing
- [ ] Integration tests completed
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Responsive design verified
- [ ] Accessibility checked
- [ ] Performance benchmarks met

### MVP Release Criteria
- [ ] All core features implemented
- [ ] Test coverage > 80%
- [ ] No critical security vulnerabilities
- [ ] Performance metrics satisfied
- [ ] User documentation complete
- [ ] Deployment pipeline ready
- [ ] Backup and recovery tested

## Post-MVP Roadmap
- Liability management (loans, credit cards)
- Budgeting and goals
- Advanced analytics and insights
- Mobile applications
- Bank synchronization
- Multi-user support
- API for third-party integrations

## Technical Debt Tracking
- [ ] Refactoring opportunities identified
- [ ] Performance bottlenecks documented
- [ ] Security improvements planned
- [ ] Code quality metrics tracked

---

*This MVP plan is focused on delivering core value quickly while maintaining high quality and setting a foundation for future growth.*