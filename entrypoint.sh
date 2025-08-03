#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 2. Check if the database is seeded
echo "Checking if database is seeded..."
# The PGPASSWORD environment variable is used by psql for the password.
# The double quotes are important to handle special characters in the password.
export PGPASSWORD="$DB_PASSWORD"
USER_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"User\" WHERE email = '$ADMIN_EMAIL';")

# Trim whitespace from the command output
USER_COUNT=$(echo "$USER_COUNT" | xargs)

if [ "$USER_COUNT" -eq 0 ]; then
  echo "Database is not seeded. Seeding now..."
  npx prisma db seed
else
  echo "Database is already seeded. Skipping seed."
fi

# Unset the password variable for security
unset PGPASSWORD

# 3. Start the websocket server in the background
echo "Starting websocket server..."
node socket-server.js &

# 4. Start the Next.js application
echo "Starting Next.js application..."
npm start
