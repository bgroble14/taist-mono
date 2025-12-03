# Local Database to Railway Staging Copy Plan

**Purpose:** Safely copy local MySQL database to Railway staging without breaking Laravel migrations  
**Created:** December 2025  
**Status:** Planning Phase

---

## Overview

This plan outlines how to copy your local MySQL database to Railway staging while ensuring Laravel migrations continue to work correctly for future deployments.

### The Problem

When you import a database dump that already has tables:
- Laravel's `migrations` table might not have records of all migrations that created those tables
- Running `php artisan migrate` after import will try to create tables that already exist → **errors**
- The `FixRailwayMigrations` command tries to guess which migrations correspond to which tables, but it's unreliable

### The Solution

**Export the `migrations` table along with your data** - Laravel tracks which migrations have been run in this table. If it's included in the dump, Railway will know exactly which migrations have already been executed.

---

## Prerequisites

- [ ] Local MySQL database running and accessible
- [ ] Railway staging environment set up with MySQL database
- [ ] Railway MySQL connection credentials available
- [ ] Railway CLI installed (`npm install -g @railway/cli`)
- [ ] Local database name matches Railway database name (or you'll rename during import)

---

## Step-by-Step Plan

### Phase 1: Prepare Local Database Export

#### Step 1.1: Verify Local Database State

```bash
# Connect to local MySQL
mysql -u root -p

# Check current database name
SHOW DATABASES;

# Use your database
USE your_database_name;

# Verify migrations table exists and has data
SELECT COUNT(*) FROM migrations;
SELECT * FROM migrations ORDER BY batch, id;

# Check what tables exist
SHOW TABLES;

# Exit MySQL
EXIT;
```

**Important:** Note the database name - you'll need it for the export.

#### Step 1.2: Export Local Database WITH Migrations Table

**Option A: Full Database Dump (Recommended)**

```bash
# Export entire database including migrations table
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  your_database_name > local_db_backup_$(date +%Y%m%d_%H%M%S).sql

# Compress to save space
gzip local_db_backup_*.sql
```

**Why `--single-transaction`?**
- Ensures consistent snapshot even if database is being used
- Prevents locks on InnoDB tables
- Critical for production-like data

**Option B: Data Only (If Schema Already Exists)**

If Railway staging already has the schema but empty tables:

```bash
# Export only data (no CREATE TABLE statements)
mysqldump -u root -p \
  --single-transaction \
  --no-create-info \
  --complete-insert \
  your_database_name > local_db_data_only_$(date +%Y%m%d_%H%M%S).sql

gzip local_db_data_only_*.sql
```

**⚠️ Warning:** Option B requires the schema to already exist. If migrations table structure differs, this won't work.

#### Step 1.3: Verify Export Contains Migrations Table

```bash
# Check that migrations table is in the dump
gunzip -c local_db_backup_*.sql.gz | grep -i "CREATE TABLE.*migrations" | head -5
gunzip -c local_db_backup_*.sql.gz | grep -i "INSERT INTO.*migrations" | head -5

# Should see:
# - CREATE TABLE `migrations` ...
# - INSERT INTO `migrations` VALUES ...
```

---

### Phase 2: Import to Railway Staging

#### Step 2.1: Get Railway MySQL Connection Details

**Via Railway Dashboard:**
1. Go to Railway → Your Project → Staging Environment
2. Click on MySQL service
3. Go to "Variables" tab
4. Note these values:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`

**Via Railway CLI:**

```bash
# Login to Railway
railway login

# Link to your project (if not already)
railway link

# Switch to staging environment
railway environment use staging

# Get MySQL variables
railway variables | grep MYSQL
```

#### Step 2.2: Test Railway MySQL Connection

```bash
# Test connection from your local machine
mysql -h $MYSQL_HOST \
      -P $MYSQL_PORT \
      -u $MYSQL_USER \
      -p$MYSQL_PASSWORD \
      $MYSQL_DATABASE \
      -e "SELECT 1 as connection_test;"
```

**If connection fails:**
- Check Railway MySQL service is running
- Verify credentials are correct
- Check if Railway allows external connections (some plans don't)

**Alternative: Use Railway Proxy (If External Connection Blocked)**

```bash
# Create SSH tunnel via Railway
railway connect mysql

# This will give you a localhost connection string
# Use that instead of direct connection
```

#### Step 2.3: Backup Current Railway Staging Database (Safety First!)

```bash
# Export current Railway staging database before overwriting
mysql -h $MYSQL_HOST \
      -P $MYSQL_PORT \
      -u $MYSQL_USER \
      -p$MYSQL_PASSWORD \
      $MYSQL_DATABASE \
      -e "SELECT 'Backup started';" > /dev/null

mysqldump -h $MYSQL_HOST \
          -P $MYSQL_PORT \
          -u $MYSQL_USER \
          -p$MYSQL_PASSWORD \
          $MYSQL_DATABASE > railway_staging_backup_before_import_$(date +%Y%m%d_%H%M%S).sql

gzip railway_staging_backup_before_import_*.sql

echo "✓ Railway staging backup saved"
```

#### Step 2.4: Import Local Database to Railway

**Option A: Full Database Import (Fresh Start)**

```bash
# Uncompress local backup
gunzip local_db_backup_*.sql.gz

# Import to Railway
mysql -h $MYSQL_HOST \
      -P $MYSQL_PORT \
      -u $MYSQL_USER \
      -p$MYSQL_PASSWORD \
      $MYSQL_DATABASE < local_db_backup_*.sql

# Recompress
gzip local_db_backup_*.sql
```

**Option B: Data Only Import (If Schema Exists)**

```bash
# Uncompress
gunzip local_db_data_only_*.sql.gz

# Import data
mysql -h $MYSQL_HOST \
      -P $MYSQL_PORT \
      -u $MYSQL_USER \
      -p$MYSQL_PASSWORD \
      $MYSQL_DATABASE < local_db_data_only_*.sql

gzip local_db_data_only_*.sql
```

**Option C: Pipe Directly (No Temp File)**

```bash
# Stream directly from compressed file
gunzip -c local_db_backup_*.sql.gz | \
  mysql -h $MYSQL_HOST \
        -P $MYSQL_PORT \
        -u $MYSQL_USER \
        -p$MYSQL_PASSWORD \
        $MYSQL_DATABASE
```

**Estimated Time:** 5-30 minutes depending on database size

---

### Phase 3: Verify Migrations Table

#### Step 3.1: Check Migrations Table Was Imported

```bash
# Connect to Railway MySQL
mysql -h $MYSQL_HOST \
      -P $MYSQL_PORT \
      -u $MYSQL_USER \
      -p$MYSQL_PASSWORD \
      $MYSQL_DATABASE

# Check migrations table
SELECT COUNT(*) as migration_count FROM migrations;
SELECT * FROM migrations ORDER BY batch, id LIMIT 20;

# Compare with local
# (Run same query on local database)
EXIT;
```

#### Step 3.2: Compare Migration Files vs Database Records

**On your local machine:**

```bash
# List all migration files
ls -1 backend/database/migrations/*.php | \
  sed 's|.*/||' | \
  sed 's|\.php$||' | \
  sort > /tmp/migration_files.txt

# Get migrations from Railway database
mysql -h $MYSQL_HOST \
      -P $MYSQL_PORT \
      -u $MYSQL_USER \
      -p$MYSQL_PASSWORD \
      $MYSQL_DATABASE \
      -Nse "SELECT migration FROM migrations ORDER BY migration;" > /tmp/migration_db.txt

# Compare
echo "=== Migrations in files but NOT in database ==="
comm -23 /tmp/migration_files.txt /tmp/migration_db.txt

echo ""
echo "=== Migrations in database but NOT in files ==="
comm -13 /tmp/migration_files.txt /tmp/migration_db.txt

echo ""
echo "=== Both match ==="
comm -12 /tmp/migration_files.txt /tmp/migration_db.txt | wc -l
echo "migrations match"
```

**Expected Result:**
- Files in codebase should match database records
- If there are mismatches, see "Troubleshooting" section below

---

### Phase 4: Test Migrations Work Correctly

#### Step 4.1: Verify No Pending Migrations

**Via Railway Terminal:**

```bash
# Connect to Railway backend service terminal
# (Railway Dashboard → Backend Service → Terminal tab)

# Or via CLI:
railway run --environment staging php artisan migrate:status
```

**Expected Output:**
```
+------+-----------------------------------------------+-------+
| Ran? | Migration                                     | Batch |
+------+-----------------------------------------------+-------+
| Yes  | 2024_11_13_124701_create_notifications_table | 1     |
| Yes  | 2025_03_26_085235_create_versions_table      | 2     |
| Yes  | 2025_12_02_000001_add_cancellation_tracking...| 3     |
...
```

All migrations should show "Yes" if your local database was up-to-date.

#### Step 4.2: Test Running New Migration (Dry Run)

**Create a test migration to verify system works:**

```bash
# In Railway terminal or locally (if connected)
railway run --environment staging php artisan make:migration test_migration_system

# This creates a new migration file
# Edit it to do something harmless, like:
# Schema::table('users', function (Blueprint $table) {
#     $table->string('test_field')->nullable();
# });

# Run it
railway run --environment staging php artisan migrate

# Should succeed and add the migration to the migrations table

# Roll it back to clean up
railway run --environment staging php artisan migrate:rollback
```

**If this works, your migration system is functioning correctly!**

#### Step 4.3: Verify Application Works

```bash
# Test API endpoint
curl https://your-railway-staging-url.up.railway.app/mapi/get-version

# Should return JSON response
```

---

## Alternative Approaches

### Approach 1: Schema + Data Separate (If Migrations Table Missing)

If your local database doesn't have a proper `migrations` table:

```bash
# Step 1: Export schema only (no data)
mysqldump -u root -p --no-data your_database_name > schema_only.sql

# Step 2: Export data only (no CREATE statements)
mysqldump -u root -p --no-create-info your_database_name > data_only.sql

# Step 3: Import schema to Railway
mysql -h $MYSQL_HOST ... < schema_only.sql

# Step 4: Run migrations to populate migrations table
railway run --environment staging php artisan migrate

# Step 5: Import data
mysql -h $MYSQL_HOST ... < data_only.sql
```

**⚠️ Problem:** This assumes migrations will create the exact same schema. If your local DB has manual changes, this won't work.

### Approach 2: Manual Migrations Table Population

If migrations table is missing or incomplete:

```bash
# 1. Import database dump
# 2. Manually insert migration records

mysql -h $MYSQL_HOST ... << 'SQL'
INSERT INTO migrations (migration, batch) VALUES
('2024_11_13_124701_create_notifications_table', 1),
('2025_03_26_085235_create_versions_table', 2),
('2025_12_02_000001_add_cancellation_tracking_to_orders', 3),
-- ... add all migrations that created existing tables
('2025_12_02_100001_create_discount_codes_table', 4),
('2025_12_02_100002_create_discount_code_usage_table', 4);
SQL
```

**⚠️ Problem:** You must manually list every migration. Error-prone.

### Approach 3: Use FixRailwayMigrations Command (Current, Unreliable)

```bash
# After importing database
railway run --environment staging php artisan railway:fix-migrations
```

**Why it's unreliable:**
- Tries to guess table names from migration filenames
- Only works for `create_*_table` migrations
- Fails for `add_*_to_*` or `modify_*` migrations
- Doesn't handle complex migrations

---

## Recommended Workflow

### For Regular Database Copies

**Use Approach: Full Database Dump with Migrations Table**

1. ✅ Export local database with `--single-transaction`
2. ✅ Verify migrations table is included
3. ✅ Import to Railway staging
4. ✅ Verify migrations table matches migration files
5. ✅ Test `migrate:status` shows all migrations as "Ran"
6. ✅ Future migrations will work normally

### For One-Time Setup

If this is the first time setting up Railway staging:

1. ✅ Create fresh MySQL database in Railway
2. ✅ Export local database (full dump)
3. ✅ Import to Railway
4. ✅ Verify migrations table
5. ✅ Test application works
6. ✅ Done - future migrations will work automatically

---

## Troubleshooting

### Issue: "Table already exists" Error When Running Migrations

**Cause:** Migrations table doesn't have records for migrations that created existing tables.

**Solution:**

```bash
# Option 1: Manually add missing migrations
mysql -h $MYSQL_HOST ... << 'SQL'
INSERT INTO migrations (migration, batch)
SELECT '2024_11_13_124701_create_notifications_table', 
       COALESCE(MAX(batch), 0) + 1 
FROM migrations;
SQL

# Option 2: Use FixRailwayMigrations (unreliable but better than nothing)
railway run --environment staging php artisan railway:fix-migrations

# Option 3: Drop and re-import with migrations table
```

### Issue: Migrations Table Missing After Import

**Cause:** Export didn't include migrations table, or it was dropped.

**Solution:**

```bash
# Recreate migrations table structure
mysql -h $MYSQL_HOST ... << 'SQL'
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

# Then manually populate or use FixRailwayMigrations
```

### Issue: Migration Files Don't Match Database Records

**Cause:** Local database has migrations that don't exist in codebase, or vice versa.

**Solution:**

```bash
# 1. List differences (see Step 3.2 above)

# 2. If database has extra migrations:
#    - These are from old migration files that were deleted
#    - Safe to leave them, or remove if you're sure

# 3. If codebase has extra migrations:
#    - These haven't been run yet
#    - Run: railway run --environment staging php artisan migrate
```

### Issue: Can't Connect to Railway MySQL Externally

**Cause:** Railway MySQL might not allow external connections on your plan.

**Solutions:**

**Option A: Use Railway Proxy**
```bash
railway connect mysql
# Follow instructions to create tunnel
```

**Option B: Use Railway Terminal**
```bash
# Railway Dashboard → MySQL Service → Terminal
# Then use mysql command from within Railway
```

**Option C: Use Railway CLI**
```bash
railway run --environment staging mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < backup.sql
```

### Issue: Import Takes Too Long / Times Out

**Solutions:**

```bash
# Increase MySQL timeout
mysql -h $MYSQL_HOST ... --max_allowed_packet=1G < backup.sql

# Or import in chunks
# Split large tables separately
mysqldump ... --where="id < 10000" table_name > chunk1.sql
mysqldump ... --where="id >= 10000" table_name > chunk2.sql
```

---

## Safety Checklist

Before importing:

- [ ] ✅ Local database backup created
- [ ] ✅ Railway staging database backed up
- [ ] ✅ Verified migrations table exists in local database
- [ ] ✅ Verified migrations table will be included in export
- [ ] ✅ Railway MySQL connection tested
- [ ] ✅ Have rollback plan ready

After importing:

- [ ] ✅ Verified migrations table imported correctly
- [ ] ✅ Checked migration files match database records
- [ ] ✅ Ran `migrate:status` - all show "Ran"
- [ ] ✅ Tested application endpoints work
- [ ] ✅ Tested running a new migration works
- [ ] ✅ Documented any manual fixes needed

---

## Best Practices

1. **Always include migrations table** in database exports
2. **Use `--single-transaction`** for consistent snapshots
3. **Backup before importing** - both source and destination
4. **Verify migrations table** after every import
5. **Test migration system** after import before deploying
6. **Document any manual fixes** for future reference

---

## Future Migrations

After successfully copying the database:

✅ **Future migrations will work normally!**

When you add a new migration:
1. Create migration file: `php artisan make:migration add_new_feature`
2. Deploy to Railway (auto-deploys on git push)
3. Railway runs: `php artisan migrate`
4. Migration executes and adds record to `migrations` table
5. Done!

**No special handling needed** - Laravel's migration system will work as designed.

---

## Quick Reference Commands

```bash
# Export local database
mysqldump -u root -p --single-transaction your_db > backup.sql
gzip backup.sql

# Get Railway credentials
railway variables --environment staging | grep MYSQL

# Import to Railway
gunzip -c backup.sql.gz | \
  mysql -h $MYSQL_HOST -P $MYSQL_PORT \
        -u $MYSQL_USER -p$MYSQL_PASSWORD \
        $MYSQL_DATABASE

# Verify migrations
railway run --environment staging php artisan migrate:status

# Test new migration
railway run --environment staging php artisan migrate
```

---

## Summary

**The Key Insight:** Laravel tracks migrations in the `migrations` table. If you export and import this table along with your data, Laravel will know exactly which migrations have been run, and future migrations will work correctly.

**The Process:**
1. Export local database (including migrations table)
2. Import to Railway staging
3. Verify migrations table matches migration files
4. Done - future migrations work automatically

**Why This Works:**
- Migrations table is just data - it travels with your database dump
- Laravel checks this table before running migrations
- If migration is recorded, Laravel skips it
- If not recorded, Laravel runs it

**No need for FixRailwayMigrations** if you do this correctly!

---

*Last Updated: December 2025*  
*Next Review: After first successful copy*

