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
- **[backend/database/migrations/2025_03_26_085235_create_versions_table.php](../backend/database/migrations/2025_03_26_085235_create_versions_table.php)** - Line 18: `default('29.0.0')`
  - Sets the default version when the database is created
  - Only applies to NEW databases or after running migrations fresh

### Native Files (iOS/Android)
- **[frontend/ios/Taist/Info.plist](../frontend/ios/Taist/Info.plist)** - `CFBundleShortVersionString`
- **[frontend/ios/Taist.xcodeproj/project.pbxproj](../frontend/ios/Taist.xcodeproj/project.pbxproj)** - `MARKETING_VERSION`
- **[frontend/android/app/build.gradle](../frontend/android/app/build.gradle)** - `versionName`

## How to Update the Version

### When Releasing a New Version:

1. **Update frontend/app.json**
   ```json
   {
     "expo": {
       "version": "30.0.0"  // Update this
     }
   }
   ```

2. **Update the database migration**
   ```php
   // backend/database/migrations/2025_03_26_085235_create_versions_table.php
   $table->string('version')->default('30.0.0');
   ```

3. **Update the database directly** (for existing databases)
   ```sql
   UPDATE versions SET version = '30.0.0' WHERE id = 1;
   ```
   Run this on:
   - Local database
   - Staging database (Railway)
   - Production database (Railway)

4. **Update native version files**
   - iOS: Info.plist and Xcode project
   - Android: build.gradle
   - See [docs/native-version-management.md](./native-version-management.md) for details

5. **Build and deploy**
   - Build new app binaries
   - Submit to App Store / Play Store
   - Deploy backend with updated migration

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

## iOS Build Number

The iOS build number is separate from the app version and must be incremented for each TestFlight/App Store submission.

### Location
- **[frontend/ios/Taist/Info.plist](../frontend/ios/Taist/Info.plist)** - Line 41-42: `CFBundleVersion`

### Current Build Number
**11**

### How to Bump
Edit `frontend/ios/Taist/Info.plist` and increment the value:
```xml
<key>CFBundleVersion</key>
<string>12</string>  <!-- Increment this number -->
```

### ⚠️ Important Notes
- The build number in `Info.plist` is the **authoritative source** for iOS builds
- `app.json` has a `buildNumber` field but `Info.plist` takes precedence for native builds
- `project.pbxproj` has `CURRENT_PROJECT_VERSION` but this is not used for the actual build number
- Always increment before submitting to TestFlight or App Store

## Version Numbering Convention

We use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** (29): Breaking changes, major features
- **MINOR** (0): New features, non-breaking changes
- **PATCH** (0): Bug fixes, small updates

Increment the appropriate number when releasing:
- Bug fixes only: 29.0.0 → 29.0.1
- New features: 29.0.0 → 29.1.0
- Major changes: 29.0.0 → 30.0.0

## Automation Ideas (Future)

Consider automating this process:
1. Create a `bump-version.sh` script that updates all files
2. Add pre-deployment checks to verify versions match
3. Use environment variables to inject version into backend
4. Create a CI/CD step to sync versions before deployment
