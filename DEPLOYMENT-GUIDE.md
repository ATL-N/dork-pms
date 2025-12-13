# Secure Production Deployment Guide

This setup implements the most secure Docker configuration for your Next.js application with:
- ✅ Read-only filesystem
- ✅ Non-root user execution
- ✅ Minimal capabilities
- ✅ Separate migration container
- ✅ No new privileges
- ✅ Tmpfs for cache (memory-only, no disk writes)

## File Structure

```
your-project/
├── Dockerfile                 # Main application Dockerfile (replace your current one)
├── Dockerfile.migrate         # Migration container Dockerfile (new file)
├── entrypoint.sh             # App entrypoint (updated - no migrations)
├── migrate.sh                # Migration script (new file)
├── docker-compose.yml        # Production compose file (updated)
├── deploy.sh                 # Deployment automation script (new file)
└── app/
    └── api/
        └── health/
            └── route.js      # Health check endpoint (create if missing)
```

## Step-by-Step Setup

### Step 1: Replace/Create Files

1. **Replace your current `Dockerfile`** with `Dockerfile.secure` → rename it to `Dockerfile`
2. **Create new file** `Dockerfile.migrate`
3. **Replace your `entrypoint.sh`** with the new version
4. **Create new file** `migrate.sh`
5. **Replace your `docker-compose.yml`** with `docker-compose.secure.yml` → rename it to `docker-compose.yml`
6. **Create new file** `deploy.sh` and make it executable:
   ```bash
   chmod +x deploy.sh
   ```
7. **Create health check endpoint** at `app/api/health/route.js`:
   ```javascript
   export async function GET() {
     return Response.json({ status: 'ok' }, { status: 200 });
   }
   ```

### Step 2: Make Scripts Executable

```bash
chmod +x entrypoint.sh migrate.sh deploy.sh
```

### Step 3: Deploy

#### Option A: Automated Deployment (Recommended)

```bash
./deploy.sh
```

This script will:
1. Build all images
2. Start database and Redis
3. Run migrations automatically
4. Start the application
5. Monitor health checks
6. Show you when everything is ready

#### Option B: Manual Deployment

```bash
# 1. Build images
docker compose build --no-cache

# 2. Start database and Redis
docker compose up -d dorkpf-db redis

# 3. Wait for database to be ready (check with)
docker compose ps

# 4. Run migrations
docker compose run --rm dorkpf-migrate

# 5. Start the application
docker compose up -d dorkpf-app cron-scheduler

# 6. Monitor logs
docker compose logs -f dorkpf-app
```

## How It Works

### Security Architecture

1. **Build Stage**: 
   - Installs all dependencies
   - Generates Prisma client
   - Builds Next.js application

2. **Migration Container** (runs once, then exits):
   - Has write access (needs to run Prisma migrations)
   - Runs as root (but isolated from app)
   - Exits after migrations complete

3. **App Container** (runs continuously):
   - Read-only filesystem (maximum security)
   - Non-root user (UID 1001)
   - Only `/tmp` and `/app/.next/cache` are writable (tmpfs - memory only)
   - No capabilities except NET_BIND_SERVICE
   - Cannot install packages or modify files

### Migration Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Database   │ ───> │  Migration   │ ───> │     App     │
│   (Ready)   │      │  Container   │      │  Container  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├─ prisma migrate deploy
                            ├─ prisma db seed
                            └─ exits
```

## Maintenance Commands

### View Logs
```bash
docker compose logs -f dorkpf-app
```

### Run New Migrations
```bash
# After adding new Prisma migrations
docker compose build dorkpf-migrate --no-cache
docker compose run --rm dorkpf-migrate
docker compose restart dorkpf-app
```

### Update Application
```bash
./deploy.sh
```

### Rollback
```bash
docker compose down
# Restore database backup if needed
./deploy.sh
```

### Check Health
```bash
docker compose ps
curl http://localhost:3008/api/health
```

## Troubleshooting

### App Won't Start
```bash
# Check logs
docker compose logs dorkpf-app

# Common issues:
# 1. Missing environment variables - check .env
# 2. Database not accessible - check DB_HOST=dorkpf-db
# 3. Migrations not run - run: docker compose run --rm dorkpf-migrate
```

### Migration Fails
```bash
# View migration logs
docker compose logs dorkpf-migrate

# Re-run migrations manually
docker compose run --rm dorkpf-migrate
```

### Read-Only Filesystem Errors
```bash
# Check if the error is about writing to disk
# If legitimate write is needed, add to tmpfs in docker-compose.yml:
tmpfs:
  - /path/to/writable/dir:uid=1001,gid=1001,mode=0755,size=100m
```

## Security Features Explained

| Feature | Purpose | Security Benefit |
|---------|---------|------------------|
| `read_only: true` | Filesystem is immutable | Prevents malware/exploits from modifying code |
| `USER nextjs (1001)` | Non-root execution | Limits damage if container is compromised |
| `cap_drop: ALL` | Remove all capabilities | Minimal privileges principle |
| `no-new-privileges` | Prevent privilege escalation | Cannot gain more permissions |
| `tmpfs` mounts | Memory-only writes | Changes lost on restart, no disk persistence |
| Separate migration container | Isolates privileged operations | App never has write access to DB schema |

## Environment Variables Required

Ensure your `.env` file has:
```env
# Database
DB_HOST=dorkpf-db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=postgres

# Auth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://yourdomain.com
AUTH_URL=https://yourdomain.com
AUTH_TRUST_HOST=true

# Domain
DOMAIN=yourdomain.com

# Redis
REDIS_PASSWORD=your_redis_password
```

## Performance Notes

- First deployment takes 3-5 minutes (builds + migrations)
- Subsequent deployments: ~1 minute (uses cached layers)
- Read-only filesystem has no performance impact
- Tmpfs mounts are faster than disk I/O

## Questions?

- Check logs: `docker compose logs -f`
- Verify health: `docker compose ps`
- Test endpoint: `curl http://localhost:3008/api/health`
