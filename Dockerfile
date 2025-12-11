FROM node:20-alpine AS builder

WORKDIR /app

# Install PostgreSQL client and other dependencies
RUN apk update && \
    apk add --no-cache postgresql-client curl

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Install PostgreSQL client for production image
RUN apk update && \
    apk add --no-cache postgresql-client curl

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/socket-server.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma ./prisma

# Copy the entrypoint script
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
EXPOSE 8080

# Run the entrypoint script
CMD ["./entrypoint.sh"]