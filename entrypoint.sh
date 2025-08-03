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
echo "Checking if General Chat exists..."
CHAT_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"Conversation\" WHERE name = 'General Chat';")

# Trim whitespace from the command output
CHAT_COUNT=$(echo "$CHAT_COUNT" | xargs)

if [ "$CHAT_COUNT" -eq 0 ]; then
  echo "General Chat not found. Seeding database..."
  npx prisma db seed
else
  echo "General Chat found. Skipping seed."
fi

# Unset the password variable for security
unset PGPASSWORD

# 4. Start the websocket server in the background
echo "Starting websocket server..."
node socket-server.js &

# 5. Start the Next.js application
echo "Starting Next.js application..."
npm start

