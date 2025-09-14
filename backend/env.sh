#!/usr/bin/env bash

# Backend environment variables
export PORT=8080
export HOST=localhost:8080

# Database configuration
export DB_HOST=localhost
export DB_PORT=5436
export DB_USER=saldoify
export DB_PASSWORD=saldoify_password
export DB_NAME=saldoify

# JWT configuration
export JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Legacy DATABASE_URL for compatibility
export DATABASE_URL=postgresql://saldoify:saldoify_password@localhost:5436/saldoify?sslmode=disable

