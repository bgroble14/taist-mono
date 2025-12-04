# Railway Migration Recovery Plan

## Current Situation Analysis

### Problem Summary
Railway deployment is crashing due to Laravel Passport OAuth migration conflicts. The error indicates:
```
SQLSTATE[42S01]: Base table or view already exists: 1050 Table 'oauth_auth_codes' already exists
```

### Root Cause Analysis

Based on codebase investigation and error logs, the issues are:

1. **Passport Vendor Migrations Running**: Laravel Passport has migration files in `vendor/laravel/passport/database/migrations/` that are being auto-discovered and executed
   - `2016_06_01_000001_create_oauth_auth_codes_table.php`
   - `2016_06_01_000002_create_oauth_access_tokens_table.php`
   - `2016_06_01_000003_create_oauth_refresh_tokens_table.php`
   - `2016_06_01_000004_create_oauth_clients_table.php`
   - `2016_06_01_000005_create_oauth_personal_access_clients_table.php`

2. **Tables Already Exist**: The OAuth tables were likely created during a previous migration or database import

3. **No Passport Configuration**: There's no `Passport::ignoreMigrations()` call in `AppServiceProvider.php` or `AuthServiceProvider.php`

4. **Railway Fix Command Limitation**: The `railway:fix-migrations` command only marks migrations as complete if:
   - It can guess the table name from the migration filename
   - The table exists in the database
   - However, it's skipping OAuth tables because it can't detect them properly

5. **Procfile Execution Order**: Current Procfile runs:
   ```
   sleep 10 → railway:fix-migrations → migrate --force → serve
   ```
   The fix command isn't catching all OAuth tables before migrate runs.

### Why This Is Happening Now

Looking at recent commits:
- `20a23c3` - "Fix OAuth migration conflicts on Railway to allow quiz_completed migration"
- `77902dd` - "Force Railway redeploy to run quiz_completed migration"
- `b710722` - "Add chef online toggle and safety quiz features"

It appears multiple attempts have been made to fix this, but the core issue (Passport migrations) hasn't been addressed.

---

## Recovery Plan

### Phase 1: Immediate Database Fix (Manual)

**Option A: Via Railway MySQL Console**

1. Connect to Railway MySQL database
2. Run these commands to mark Passport migrations as complete:

```sql
-- Check current migrations
SELECT * FROM migrations WHERE migration LIKE '%oauth%';

-- If no OAuth migrations exist, add them manually
-- Get current max batch number
SELECT MAX(batch) FROM migrations;

-- Insert OAuth migration records (replace X with max_batch + 1)
INSERT INTO migrations (migration, batch) VALUES
('2016_06_01_000001_create_oauth_auth_codes_table', X),
('2016_06_01_000002_create_oauth_access_tokens_table', X),
('2016_06_01_000003_create_oauth_refresh_tokens_table', X),
('2016_06_01_000004_create_oauth_clients_table', X),
('2016_06_01_000005_create_oauth_personal_access_clients_table', X);
```

**Option B: Update `FixRailwayMigrations` Command**

Enhance the command to explicitly handle OAuth/Passport tables:

```php
// Add to FixRailwayMigrations.php in guessTableName() method
private function guessTableName($migrationName)
{
    // Special handling for OAuth/Passport tables
    $oauthTables = [
        '2016_06_01_000001_create_oauth_auth_codes_table' => 'oauth_auth_codes',
        '2016_06_01_000002_create_oauth_access_tokens_table' => 'oauth_access_tokens',
        '2016_06_01_000003_create_oauth_refresh_tokens_table' => 'oauth_refresh_tokens',
        '2016_06_01_000004_create_oauth_clients_table' => 'oauth_clients',
        '2016_06_01_000005_create_oauth_personal_access_clients_table' => 'oauth_personal_access_clients',
    ];

    if (isset($oauthTables[$migrationName])) {
        $tableName = $oauthTables[$migrationName];
        if (Schema::hasTable($tableName)) {
            return $tableName;
        }
    }

    // ... rest of existing logic
}
```

### Phase 2: Prevent Future Conflicts (Code Changes)

**Solution 1: Ignore Passport Migrations (RECOMMENDED)**

Add to `AppServiceProvider.php`:

```php
use Laravel\Passport\Passport;

public function register()
{
    // Ignore Passport's default migrations since tables already exist
    Passport::ignoreMigrations();
}
```

This tells Laravel to skip Passport's vendor migrations entirely.

**Solution 2: Load Passport Keys from Custom Location**

If you need more control:

```php
public function boot()
{
    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

### Phase 3: Fix New Migrations

Your recent migrations are also failing:

```
Skipped: 2025_12_02_000002_add_ai_tracking_to_reviews (table doesn't exist)
Skipped: 2025_12_02_000001_add_cancellation_tracking_to_orders (table doesn't exist)
Skipped: 2025_12_03_000001_add_reminder_tracking_to_orders (table doesn't exist)
Skipped: 2025_12_03_000002_add_online_status_to_users (table doesn't exist)
Skipped: 2025_12_03_000002_add_quiz_completed_to_users (table doesn't exist)
Skipped: 2025_12_03_000003_create_availability_overrides (table doesn't exist)
```

These need to run. Ensure:
1. Base tables exist (`tbl_orders`, `tbl_users`, `reviews`, etc.)
2. Migrations run in correct order
3. Use `Schema::hasTable()` checks in migrations for safety

---

## Step-by-Step Recovery Instructions

### Step 1: Fix Passport Migrations (Choose One)

**Quick Fix (Code Change):**
```bash
# Edit AppServiceProvider.php to add Passport::ignoreMigrations()
# This is the fastest solution
```

**Manual Database Fix:**
```bash
# Connect to Railway MySQL and run SQL INSERT commands above
# This works without code changes
```

### Step 2: Verify Database State

Check which tables exist:
```sql
SHOW TABLES LIKE 'oauth%';
SHOW TABLES LIKE 'tbl_%';
```

### Step 3: Test Locally First

```bash
cd backend
php artisan migrate:status
php artisan migrate --pretend
```

### Step 4: Deploy Fix

```bash
git add .
git commit -m "Fix: Ignore Passport migrations to prevent Railway conflicts"
git push
```

### Step 5: Monitor Deployment

Check Railway logs for:
- ✓ Database connection successful
- ✓ railway:fix-migrations completed
- ✓ Migrations ran successfully
- ✓ Server started on port $PORT

---

## Recommended Solution

**Best approach:** Use Solution 1 (Ignore Passport Migrations)

**Why:**
1. Cleanest solution - no database manipulation needed
2. Prevents future conflicts automatically
3. Standard Laravel/Passport pattern
4. Works across all environments (local, staging, production)

**Implementation:**

1. Edit `backend/app/Providers/AppServiceProvider.php`:
```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Ignore Passport's default migrations since tables already exist
        Passport::ignoreMigrations();
    }

    public function boot()
    {
        //
    }
}
```

2. Commit and push:
```bash
git add backend/app/Providers/AppServiceProvider.php
git commit -m "Fix: Ignore Passport vendor migrations on Railway"
git push
```

3. Railway will auto-deploy and migrations should succeed

---

## Prevention Checklist

- [ ] Add `Passport::ignoreMigrations()` to AppServiceProvider
- [ ] Ensure all new migrations use `Schema::hasTable()` checks
- [ ] Test migrations locally with `--pretend` flag before deploying
- [ ] Use `.disabled` extension for migrations that shouldn't run yet
- [ ] Keep Railway manual setup SQL file updated
- [ ] Document any manual database changes in git

---

## Additional Notes

### Why OAuth Tables Exist

The OAuth tables likely exist because:
1. Previous database import included them
2. Manual creation via `railway-manual-setup.sql`
3. Earlier successful Passport installation

### Future Migrations Strategy

For new features, consider:
1. Make migrations idempotent (check existence before creating)
2. Use separate up/down methods properly
3. Test rollback scenarios
4. Keep staging and production in sync

---

## References

- [Laravel Passport Migration Issues - Stack Overflow](https://stackoverflow.com/questions/69366994/laravel-testing-database-migration-fails-due-to-passport)
- [Passport Migrations Ignore Database Option - GitHub](https://github.com/laravel/passport/issues/1370)
- [Laravel Migration Rollback Best Practices](https://neon.com/guides/laravel-migration-rollbacks)
- [Avoid Laravel Migration Failures](https://shivlab.com/blog/avoid-laravel-migration-failures/)

---

## Status

**Current State:** 🔴 Railway deployment failing
**Next Action:** Implement `Passport::ignoreMigrations()` fix
**ETA:** 5 minutes to implement, 5-10 minutes for Railway to deploy
