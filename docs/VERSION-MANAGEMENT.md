# Version Management Guide

## Overview

The Taist app uses a centralized version management system to ensure consistency across the frontend app, backend API, and database.

## Current Version

**29.0.0**

## How Version Enforcement Works

1. When users open the app, the splash screen calls the backend API endpoint `/getVersion`
2. The API returns the version stored in the `versions` database table
3. The app compares this version with the version in `frontend/app.json`
4. If they don't match, users see an "Update Required" dialog

## Where Version Numbers Are Stored

### Frontend
- **[frontend/app.json](../frontend/app.json)** - Line 5: `"version": "29.0.0"`
  - Controls the version displayed in app stores
  - Used by the version check in splash screen

### Backend
- **[backend/VERSION](../backend/VERSION)** - Contains current version (e.g., `29.0.0`)
  - Single source of truth for backend version
  - Automatically synced from `frontend/app.json` via `scripts/sync-version.sh`
  - Read by `VersionSeeder` during Railway deployments
  
- **[backend/database/seeds/VersionSeeder.php](../backend/database/seeds/VersionSeeder.php)**
  - Automatically runs on every Railway deployment (via Procfile)
  - Reads version from `backend/VERSION` file
  - Updates database `versions` table automatically
  
- **[backend/database/migrations/2025_03_26_085235_create_versions_table.php](../backend/database/migrations/2025_03_26_085235_create_versions_table.php)** - Line 18: `default('29.0.0')`
  - Sets the default version when the database is created
  - Only applies to NEW databases or after running migrations fresh

### Native Files (iOS/Android)
- **[frontend/ios/Taist/Info.plist](../frontend/ios/Taist/Info.plist)** - `CFBundleShortVersionString`
- **[frontend/ios/Taist.xcodeproj/project.pbxproj](../frontend/ios/Taist.xcodeproj/project.pbxproj)** - `MARKETING_VERSION`
- **[frontend/android/app/build.gradle](../frontend/android/app/build.gradle)** - `versionName`

## How to Update the Version

### Automated Version Sync (Recommended)

The version system now automatically syncs from `frontend/app.json` to the database via Railway deployments.

**When Releasing a New Version:**

1. **Update frontend/app.json**
   ```json
   {
     "expo": {
       "version": "30.0.0"  // Update this
     }
   }
   ```

2. **Sync version to backend** (automatic sync)
   ```bash
   ./scripts/sync-version.sh
   ```
   This updates `backend/VERSION` file which Railway uses during deployment.

3. **Commit and push** - Railway will automatically:
   - Deploy the backend with the new `VERSION` file
   - Run migrations
   - Run `VersionSeeder` (reads from `VERSION` file and updates database)
   - Database version will be synced automatically! ✅

4. **Update native version files** (if needed)
   - iOS: Info.plist and Xcode project
   - Android: build.gradle
   - See [frontend/VERSION-BUMP-GUIDE.md](../frontend/VERSION-BUMP-GUIDE.md) for details

5. **Build and deploy app**
   - Build new app binaries
   - Submit to App Store / Play Store

### Manual Version Update (Legacy - Only if automated sync fails)

If the automated sync isn't working, you can manually update:

1. **Update backend/VERSION file**
   ```bash
   echo "30.0.0" > backend/VERSION
   ```

2. **Or set APP_VERSION environment variable in Railway**
   ```
   APP_VERSION=30.0.0
   ```

3. **Or manually update database** (last resort)
   ```sql
   UPDATE versions SET version = '30.0.0' WHERE id = 1;
   ```

## Critical Rules

### ⚠️ NEVER mix versions:
- If app.json says 29.0.0, database MUST say 29.0.0
- Mismatched versions = "Update Required" dialog for all users

### ✅ ALWAYS update in this order:
1. Update database first (UPDATE query)
2. Deploy backend code
3. Submit app to stores
4. Wait for app store approval before forcing updates

### 🔄 For Existing Deployments:
- The migration default only affects NEW databases
- You MUST run an UPDATE query on existing databases
- Don't rely on migrations to update production versions

## Testing Version Updates

### Local Development:
```typescript
// In frontend/app.json, you can set APP_ENV to skip version check
"extra": {
  "APP_ENV": "local"  // Skips version enforcement
}
```

### TestFlight / Staging:
1. Update database: `UPDATE versions SET version = 'X.X.X'`
2. Update app.json: `"version": "X.X.X"`
3. Build and upload to TestFlight
4. Test that users can open the app without "Update Required"

## Troubleshooting

### "Update Required" appears on TestFlight
**Cause**: Database version doesn't match app.json version

**Fix**:
```sql
-- Check current database version
SELECT * FROM versions;

-- Update to match app.json
UPDATE versions SET version = '29.0.0' WHERE id = 1;
```

### Users stuck on old version
**Cause**: New version not approved in app stores yet

**Fix**: Don't update database version until new app is available in stores

### Version check not working
**Cause**: API endpoint failing or returning wrong format

**Debug**:
1. Check backend logs for `/getVersion` endpoint
2. Verify `versions` table exists and has data
3. Check splash screen console logs for API response

## Database Queries

### Check current version:
```sql
SELECT * FROM versions;
```

### Update version:
```sql
UPDATE versions SET version = '29.0.0' WHERE id = 1;
```

### Add version record if missing:
```sql
INSERT INTO versions (version, created_at, updated_at)
VALUES ('29.0.0', NOW(), NOW());
```

## Version Numbering Convention

We use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** (29): Breaking changes, major features
- **MINOR** (0): New features, non-breaking changes
- **PATCH** (0): Bug fixes, small updates

Increment the appropriate number when releasing:
- Bug fixes only: 29.0.0 → 29.0.1
- New features: 29.0.0 → 29.1.0
- Major changes: 29.0.0 → 30.0.0

## Automation (Current Implementation)

✅ **Automated version sync is now implemented:**

1. **Version Sync Script**: `scripts/sync-version.sh`
   - Syncs version from `frontend/app.json` to `backend/VERSION`
   - Run manually when updating versions

2. **Automatic Database Sync**: `VersionSeeder`
   - Runs automatically on every Railway deployment (via Procfile)
   - Reads from `backend/VERSION` file
   - Updates database `versions` table

3. **Fallback Options**:
   - Environment variable: `APP_VERSION` (set in Railway)
   - Manual database update (last resort)

### Future Improvements

Consider:
- Pre-commit hook to auto-sync versions
- CI/CD step to verify versions match before deployment
- Automated version bump script for all files (app.json, native files, etc.)
