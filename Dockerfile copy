FROM node:18-alpine AS builder

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
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Install PostgreSQL client for production image
RUN apk update && \
    apk add --no-cache postgresql-client curl

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Add healthcheck
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:3000/api/health || exit 1

# Run Prisma migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]