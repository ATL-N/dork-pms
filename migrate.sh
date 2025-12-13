#!/bin/sh
# Migration script - runs before the main app starts
set -e

echo "=== Database Migration Script ==="

# Wait for the database to be ready
echo "Waiting for database to be ready..."
export PGPASSWORD="$DB_PASSWORD"
ATTEMPTS=0
MAX_ATTEMPTS=30
while ! psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' > /dev/null 2>&1;
do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "Database is not ready after $MAX_ATTEMPTS attempts. Exiting."
    exit 1
  fi
  echo "Database is not ready. Retrying in 2 seconds..."
  sleep 2
done
echo "Database is ready."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if the database needs seeding
echo "Checking if database needs seeding..."
npx prisma db seed || echo "Database already seeded or seeding not required."

# Unset the password variable for security
unset PGPASSWORD

echo "=== Migration completed successfully ==="
