# CRITICAL FIX: Railway Migration Infinite Loop

**Date:** December 4, 2025
**Severity:** CRITICAL - Service Down
**Status:** ✅ Fix Deployed (Commit `488c8df`)
**Issue:** Infinite crash loop preventing Railway from starting

---

## The Vicious Cycle

Railway was stuck in an infinite crash loop:

```
1. railway:fix-migrations runs
   → Checks for tbl_availability_overrides
   → Can't find it (detection failed)
   → Skips marking it as migrated

2. migrate --force runs
   → Tries to run 2025_12_03_000003_create_availability_overrides
   → Attempts: CREATE TABLE tbl_availability_overrides
   → ERROR: Table already exists!
   → Migration fails, never recorded in migrations table
   → Deployment crashes

3. Railway restarts, repeats from step 1
   → Loop continues forever ♾️
```

---

## Root Cause Analysis

### Why The Table Exists But Migration Isn't Recorded

From previous deployment attempts:
1. Migration `2025_12_03_000003` started running
2. Created table `tbl_availability_overrides` successfully
3. Tried to create foreign key with wrong type (int vs bigint unsigned)
4. Foreign key creation FAILED
5. Laravel **never recorded** the migration (because it failed)
6. Table remains in database in broken state

### Why FixRailwayMigrations Couldn't Detect It

The `guessTableName()` method logic:
```php
// For "2025_12_03_000003_create_availability_overrides"
preg_match('/create_(.+?)_table/', $migrationName, $matches)
// Extracts: "availability_overrides"

// Checks if table exists
Schema::hasTable('availability_overrides')  // ❌ FALSE
Schema::hasTable('tbl_availability_overrides')  // ✅ TRUE (but regex already failed)
```

The problem: The regex extracts "availability_overrides" but actual table is "tbl_availability_overrides". Even though there's fallback logic to check `tbl_` prefix (line 167), it never got there because the first regex didn't match the expected pattern.

---

## The Solution

### Strategy: Explicit Migration-to-Table Mapping

Added `getKnownProblematicMigrations()` method that explicitly maps known problematic migrations:

```php
private function getKnownProblematicMigrations()
{
    return [
        '2025_12_03_000003_create_availability_overrides' => 'tbl_availability_overrides',
    ];
}
```

### How It Works

Enhanced `FixRailwayMigrations` command with new section:

```php
// Second, handle known problematic migrations that failed before
$this->info("\nChecking known problematic migrations...");
$problematicMigrations = $this->getKnownProblematicMigrations();

foreach ($problematicMigrations as $migrationName => $tableName) {
    // Check if migration already recorded
    $exists = DB::table('migrations')->where('migration', $migrationName)->exists();

    if ($exists) {
        $this->line("  Already migrated: {$migrationName}");
        continue;
    }

    // Check if broken table exists
    if (Schema::hasTable($tableName)) {
        // Mark as migrated to prevent re-run
        DB::table('migrations')->insert([
            'migration' => $migrationName,
            'batch' => $newBatch,
        ]);
        $this->line("✓ Marked as migrated: {$migrationName} (existing broken table: {$tableName})");
    }
}
```

---

## What Happens on Railway Now

### Execution Flow

```
1. Procfile runs: railway:fix-migrations

   Checking Passport OAuth tables...
   → (skips already migrated OAuth tables)

   Checking known problematic migrations...
   → Finds tbl_availability_overrides EXISTS
   → ✓ Marks 2025_12_03_000003 as migrated
   → Skips it from future runs

   Checking application migrations...
   → (other app migrations)

2. Procfile runs: migrate --force

   → Skips 2025_12_03_000003 (already in migrations table)
   → Migrating: 2025_12_03_000004_fix_availability_overrides_foreign_key
   →   DROP TABLE IF EXISTS tbl_availability_overrides
   →   CREATE TABLE tbl_availability_overrides (...chef_id bigint unsigned...)
   →   ADD CONSTRAINT foreign key (chef_id) references tbl_users(id)
   → ✓ Migrated successfully!

3. Server starts ✓
```

---

## Why This Is The Safest Fix

### Safety Guarantees

1. **Only Acts on Existing Tables**
   - Checks `Schema::hasTable()` before marking as migrated
   - Won't mark migrations that haven't run

2. **Idempotent**
   - Checks if migration already recorded
   - Safe to run multiple times
   - Won't create duplicates

3. **Explicit, Not Heuristic**
   - Doesn't rely on pattern matching
   - Directly maps migration name → table name
   - No guessing or inference

4. **Allows Fix Migration to Run**
   - Marks broken migration as complete
   - Lets cleanup migration (000004) execute
   - Drops and recreates table properly

5. **Doesn't Affect Other Migrations**
   - Only targets known problematic ones
   - Normal migrations still detected by guessTableName()
   - OAuth handling unchanged

---

## Alternative Approaches Considered

### ❌ Option 1: Manual Database Fix
```sql
INSERT INTO migrations (migration, batch) VALUES
('2025_12_03_000003_create_availability_overrides', 999);
```
**Rejected:** Not in version control, not repeatable, manual intervention required

### ❌ Option 2: Improve guessTableName() Regex
**Rejected:** Complex, error-prone, might break other migrations

### ❌ Option 3: Make Original Migration Idempotent
```php
Schema::dropIfExists('tbl_availability_overrides');
Schema::create('tbl_availability_overrides', ...);
```
**Rejected:** Migration already ran (partially), can't change it retroactively

### ❌ Option 4: Delete Migration 000003 Entirely
**Rejected:** Would leave database in inconsistent state, loses history

### ✅ Option 5: Explicit Problematic Migration List (CHOSEN)
**Why:** Clean, safe, maintainable, version controlled, repeatable

---

## Technical Details

### Files Modified

**Commit `488c8df`:**
```
backend/app/Console/Commands/FixRailwayMigrations.php (+45 lines)
```

### Code Changes

1. **Added Method:** `getKnownProblematicMigrations()`
   - Returns array of migration → table mappings
   - Currently contains: 2025_12_03_000003 → tbl_availability_overrides
   - Easy to extend for future issues

2. **Added Section in handle():**
   - Runs after OAuth checks, before app migrations
   - Explicitly checks known problematic tables
   - Marks as migrated if found

### Execution Order

```
FixRailwayMigrations::handle() now runs:
1. OAuth migrations check
2. Known problematic migrations check  ← NEW
3. Regular app migrations check
```

---

## Testing

### Local Testing
✅ PHP syntax validation passed
✅ Command loads without errors
✅ Logic reviewed for safety

### Railway Testing (Expected)
⏳ Awaiting deployment completion

Expected logs:
```
Checking known problematic migrations...
✓ Marked as migrated: 2025_12_03_000003_create_availability_overrides (existing broken table: tbl_availability_overrides)

Migrating: 2025_12_03_000004_fix_availability_overrides_foreign_key
  drop table if exists `tbl_availability_overrides`
  create table `tbl_availability_overrides` (
    `chef_id` bigint unsigned not null,
    ...
  )
Migrated: 2025_12_03_000004_fix_availability_overrides_foreign_key
```

---

## Recovery Timeline

### Issue Started
- **First Occurrence:** Previous deployment with foreign key type mismatch
- **Impact:** Railway service down, unable to start

### Fix Attempts

1. **Commit `1e00da0`:** Fixed OAuth migrations (worked)
2. **Commit `095550e`:** Fixed foreign key type + added cleanup migration
   - **Result:** Still looping - table exists but can't detect it
3. **Commit `488c8df`:** Added explicit problematic migration detection
   - **Result:** Should break the loop ✅

---

## Future Prevention

### For Similar Issues

If another migration fails in the future leaving a table in broken state:

1. **Identify:** Check Railway logs for "Table already exists" errors
2. **Verify:** Connect to database, confirm table exists but migration not recorded
3. **Add to List:** Update `getKnownProblematicMigrations()`:
   ```php
   '2025_XX_XX_XXXXXX_migration_name' => 'actual_table_name',
   ```
4. **Commit & Deploy:** Push the change
5. **Cleanup:** Create fix migration to recreate table properly

### Best Practices

1. **Always use correct column types** for foreign keys
2. **Test migrations locally** with same MySQL version as production
3. **Use `migrate --pretend`** before deploying
4. **Make migrations idempotent** when possible:
   ```php
   if (!Schema::hasTable('table_name')) {
       Schema::create(...);
   }
   ```

---

## Monitoring

### Success Indicators

✅ No "Table already exists" errors in Railway logs
✅ Migration 2025_12_03_000003 shown as migrated
✅ Migration 2025_12_03_000004 executes and succeeds
✅ Server starts successfully
✅ No crash/restart loop

### If Still Failing

Check these:
1. Is table actually in database? `SHOW TABLES LIKE 'tbl_availability_overrides';`
2. Is migration in migrations table? `SELECT * FROM migrations WHERE migration LIKE '%availability_overrides%';`
3. Did FixRailwayMigrations run? Look for "Checking known problematic migrations..." in logs
4. Any other errors? Check full stack trace

---

## Related Documentation

- [RAILWAY_MIGRATION_RECOVERY_PLAN.md](RAILWAY_MIGRATION_RECOVERY_PLAN.md) - Original analysis
- [MIGRATION_FIXES_COMPLETE.md](MIGRATION_FIXES_COMPLETE.md) - Previous fixes summary

---

## Status

**Current State:** Fix deployed, awaiting Railway build
**Expected Resolution:** 5-10 minutes from push
**Next Action:** Monitor Railway logs for successful deployment

**Commit:** `488c8df`
**Deployed:** Yes (pushed to main)
**Verified:** Pending Railway completion

---

**Last Updated:** December 4, 2025
**Severity:** CRITICAL → Mitigated (fix deployed)
