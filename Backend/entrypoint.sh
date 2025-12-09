#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run migrations
echo "Running database migrations..."
uv run alembic upgrade head

# Start server
echo "Starting application..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
