# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal finance web application built with:
- **SvelteKit 2.16.0** with **Svelte 5** (using new runes syntax)
- **TypeScript** with strict mode
- **PostgreSQL** database with **Drizzle ORM**
- **TailwindCSS v4** for styling
- **Vite** as the build tool

## Essential Commands

### Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Code Quality
```bash
npm run check      # Run svelte-check for type checking
npm run format     # Format code with Prettier
```

### Database
```bash
npm run db:push    # Push schema changes to database
npm run db:migrate # Run database migrations
npm run db:studio  # Open Drizzle Studio for database inspection
```

## Architecture Overview

### Directory Structure
- `src/routes/` - SvelteKit pages and API routes
- `src/lib/` - Shared components and utilities
- `src/lib/server/` - Server-only code (database, auth)
- `src/lib/server/db/schema.ts` - Database schema definitions

### Authentication System
The app uses a custom session-based authentication system (not Lucia):
- Sessions stored in PostgreSQL with 30-day expiration
- Automatic session renewal when < 15 days remaining
- Argon2 for password hashing
- Key functions in `src/lib/server/auth.ts`:
  - `createSession()` - Creates new session
  - `validateSessionToken()` - Validates and renews sessions
  - `invalidateSession()` - Logs out user

### Database Access
- Uses Drizzle ORM with type-safe queries
- Connection configured via `DATABASE_URL` environment variable
- Schema includes `user` and `session` tables
- Access database through `src/lib/server/db/index.ts`

### Routing Patterns
- `+page.svelte` - Page components
- `+page.server.ts` - Server-side logic and form actions
- `+layout.svelte` - Layout components
- Server-only imports must use `$lib/server/` path

## Key Development Notes

1. **Svelte 5 Syntax**: Use `$props()` rune for component props
2. **Server Code**: Keep server-only code in `$lib/server/` directory
3. **Environment**: Set `DATABASE_URL` in `.env` file (see `.env.example`)
4. **Type Safety**: TypeScript strict mode is enabled - ensure proper typing

## Shadcn Component Management
- Use `npx shadcn-svelte@latest add` for adding new components from shadcn