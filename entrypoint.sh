#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Wait for the database to be ready
echo "Waiting for database to be ready..."
export PGPASSWORD="$DB_PASSWORD"
ATTEMPTS=0
MAX_ATTEMPTS=20
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

# 2. Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 3. Check if the database is seeded
echo "Seeding database..."
  npx prisma db seed

# 4. Prune development dependencies to reduce image size
echo "Pruning development dependencies..."
npm prune --production

# Unset the password variable for security
unset PGPASSWORD

# 6. Start the Next.js application
echo "Starting Next.js application..."
npm start