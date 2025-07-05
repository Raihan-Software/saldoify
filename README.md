# Saldoify - Personal Finance Web Application

A modern personal finance management application built with SvelteKit, PostgreSQL, and Docker.

## Tech Stack

- **Frontend**: SvelteKit 2.16.0 with Svelte 5
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: TailwindCSS v4
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose installed on your system
- Node.js 20+ (for local development without Docker)
- Git

## Quick Start with Docker

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd saldoify
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and update the DATABASE_URL:
```
DATABASE_URL="postgresql://saldoify:saldoify_password@localhost:5436/saldoify"
```

### 3. Start the application

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL on port 5436
- Start the SvelteKit application on port 3001
- Create the database and run migrations automatically

### 4. Access the application

Open your browser and navigate to: http://localhost:3001

## Docker Commands

### Start services
```bash
docker-compose up -d        # Start in background
docker-compose up           # Start with logs
```

### Stop services
```bash
docker-compose down         # Stop containers
docker-compose down -v      # Stop and remove volumes (⚠️ deletes data)
```

### View logs
```bash
docker-compose logs -f      # All services
docker-compose logs -f app  # App only
docker-compose logs -f postgres  # Database only
```

### Rebuild after code changes
```bash
docker-compose build app
docker-compose up -d
```

### Database management
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U saldoify -d saldoify

# Run database migrations
docker-compose exec app npm run db:push

# Open Drizzle Studio (database GUI)
docker-compose exec app npm run db:studio
```

## Local Development (without Docker)

If you prefer to develop locally without Docker:

### 1. Install dependencies
```bash
npm install
```

### 2. Set up PostgreSQL
- Install PostgreSQL locally
- Create a database named `saldoify`
- Update `.env` with your local database credentials

### 3. Run database migrations
```bash
npm run db:push
```

### 4. Start development server
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Development Workflow

### Code quality commands
```bash
npm run check      # Type checking
npm run format     # Format code with Prettier
```

### Database commands
```bash
npm run db:push    # Push schema changes
npm run db:migrate # Run migrations
npm run db:studio  # Open database GUI
```

### Building for production
```bash
npm run build      # Build the application
npm run preview    # Preview production build
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── server/         # Server-side code
│   │   ├── auth.ts     # Authentication logic
│   │   └── db/         # Database configuration
│   └── modules/        # Feature modules
├── routes/             # SvelteKit pages
│   ├── assets/         # Asset management
│   └── (app)/         # Main app routes
└── app.css            # Global styles
```

## Features

- 🏦 Asset tracking and management
- 💰 Income and expense monitoring
- 📊 Financial dashboard with key metrics
- 🔐 Secure authentication system
- 🌓 Light/dark mode support
- 📱 Responsive design

## Troubleshooting

### Port conflicts
If ports 5436 or 3001 are already in use, update the port mappings in `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "5434:5432"  # Change 5434 to any available port
  app:
    ports:
      - "3002:3000"  # Change 3002 to any available port
```

### Database connection issues
- Ensure Docker services are running: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Verify DATABASE_URL in `.env` matches your setup

### Build failures
- Clear Docker cache: `docker-compose build --no-cache`
- Remove node_modules: `rm -rf node_modules`
- Rebuild: `docker-compose up --build`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

[Your License Here]