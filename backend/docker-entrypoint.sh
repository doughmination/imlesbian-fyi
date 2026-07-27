#!/bin/sh
set -e

echo "Running database migrations..."
bun run src/db/migrate.ts

echo "Starting server..."
exec "$@"
