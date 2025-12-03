# Quick Start: Copy Local Database to Railway Staging

**Purpose:** Safely copy your local MySQL database to Railway staging while preserving the migrations table.

---

## Prerequisites

- MySQL client installed (`mysql`, `mysqldump`)
- Railway CLI installed (`npm install -g @railway/cli`) - optional but recommended
- Local MySQL database running
- Railway staging environment with MySQL service
- **Railway project linked** (run `railway link` first - see `RAILWAY-SETUP-FIRST.md`)

---

## Method 1: Using Railway Proxy (Recommended)

This method uses Railway's built-in proxy connection, which is the most reliable way to connect.

### Step 0: Link Railway Project (First Time Only)

If you haven't linked your Railway project yet:

```bash
cd /Users/williamgroble/taist-mono
railway link
```

Select your workspace and project when prompted. See `RAILWAY-SETUP-FIRST.md` for details.

### Step 1: Set up Railway Proxy Connection

In a **separate terminal**, start the Railway proxy:

```bash
cd /Users/williamgroble/taist-mono
railway connect mysql --environment staging
```

This will create a local proxy connection. Keep this terminal open.

### Step 2: Run the Copy Script

In your main terminal:

```bash
cd /Users/williamgroble/taist-mono

# Set your local database name (if different from default)
export LOCAL_DB_NAME="taist_local"  # or your actual local DB name

# Set Railway credentials
export RAILWAY_DB_NAME="railway"
export RAILWAY_DB_USER="root"
export RAILWAY_DB_PASS="FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe"

# Run the script
./scripts/copy-local-to-railway-db.sh
```

The script will:
- Export your local database (including migrations table)
- Backup Railway staging database first (safety!)
- Import to Railway staging
- Verify migrations table was imported correctly
- Test migrations status

---

## Method 2: Direct Connection (If Proxy Doesn't Work)

If Railway proxy doesn't work, you can use direct connection:

### Step 1: Get Railway Connection Details

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Get MySQL connection variables
railway variables --environment staging | grep MYSQL
railway variables --environment staging | grep RAILWAY_PRIVATE_DOMAIN
```

### Step 2: Run Script with Direct Connection

```bash
# Set Railway host and port (from Railway variables)
export RAILWAY_HOST="your-railway-private-domain.up.railway.internal"
export RAILWAY_PORT="3306"
export RAILWAY_DB_NAME="railway"
export RAILWAY_DB_USER="root"
export RAILWAY_DB_PASS="FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe"

# Run script
./scripts/copy-local-to-railway-db.sh
```

---

## Method 3: Manual Steps (If Script Fails)

If the automated script doesn't work, follow these manual steps:

### Step 1: Export Local Database

```bash
# Export local database (replace with your actual DB name)
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  taist_local > local_backup_$(date +%Y%m%d_%H%M%S).sql

# Compress
gzip local_backup_*.sql
```

**Important:** Verify migrations table is included:
```bash
gunzip -c local_backup_*.sql.gz | grep -i "CREATE TABLE.*migrations"
```

### Step 2: Connect to Railway MySQL

```bash
# Start Railway proxy (in separate terminal)
railway connect mysql --environment staging

# In main terminal, import using proxy
gunzip -c local_backup_*.sql.gz | \
  mysql -h 127.0.0.1 -P 3306 \
        -u root \
        -pFPFWmAogihfsrnuQjyyBWkdqPJTMaKQe \
        railway
```

### Step 3: Verify Migrations Table

```bash
mysql -h 127.0.0.1 -P 3306 \
      -u root \
      -pFPFWmAogihfsrnuQjyyBWkdqPJTMaKQe \
      railway \
      -e "SELECT COUNT(*) as migration_count FROM migrations;"
```

### Step 4: Test Migrations Status

```bash
railway run --environment staging php artisan migrate:status
```

All migrations should show "Yes" if everything worked correctly.

---

## Troubleshooting

### "Cannot connect to Railway database"

**Solution:** Make sure Railway proxy is running:
```bash
railway connect mysql --environment staging
```

### "Migrations table not found in backup"

**Cause:** Your local database doesn't have a migrations table, or it wasn't exported.

**Solution:** 
1. Check local database has migrations table:
   ```bash
   mysql -u root -p taist_local -e "SELECT COUNT(*) FROM migrations;"
   ```
2. If missing, run migrations locally first:
   ```bash
   cd backend
   php artisan migrate
   ```

### "Table already exists" errors after import

**Cause:** Migrations table wasn't imported correctly.

**Solution:** Use the FixRailwayMigrations command:
```bash
railway run --environment staging php artisan railway:fix-migrations
```

### Import takes too long or times out

**Solution:** Increase MySQL timeout:
```bash
mysql -h $RAILWAY_HOST ... --max_allowed_packet=1G < backup.sql
```

---

## Verification Checklist

After copying, verify:

- [ ] Migrations table has records: `SELECT COUNT(*) FROM migrations;`
- [ ] Migration files match database: `railway run --environment staging php artisan migrate:status`
- [ ] Application works: `curl https://your-app.up.railway.app/mapi/get-version`
- [ ] New migrations can run: Create a test migration and run it

---

## Why This Works

Laravel tracks which migrations have been run in the `migrations` table. When you export your local database:

1. ✅ The `migrations` table is included in the dump
2. ✅ Railway gets a copy of this table
3. ✅ Laravel knows which migrations have already run
4. ✅ Future migrations work automatically

**Key Point:** Always include the migrations table in your database exports!

---

## Quick Reference

```bash
# Export local DB
mysqldump -u root -p --single-transaction taist_local > backup.sql
gzip backup.sql

# Connect Railway proxy
railway connect mysql --environment staging

# Import to Railway
gunzip -c backup.sql.gz | mysql -h 127.0.0.1 -u root -pPASSWORD railway

# Verify
railway run --environment staging php artisan migrate:status
```

---

*Last Updated: December 2025*

