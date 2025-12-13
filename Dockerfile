# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk update && \
    apk add --no-cache postgresql-client curl && \
    rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install ALL dependencies (not just production)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies
RUN apk update && \
    apk add --no-cache postgresql-client curl dumb-init && \
    rm -rf /var/cache/apk/*

# Copy package files for runtime dependencies
COPY package*.json ./

# Install production dependencies (needed for Prisma)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder (CRITICAL - this was missing!)
COPY --from=builder /app/public ./public

# Copy socket server and entrypoint
COPY --from=builder /app/socket-server.js ./socket-server.js
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Expose ports
EXPOSE 3000
EXPOSE 8080

# Use dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run the application
CMD ["./entrypoint.sh"]
