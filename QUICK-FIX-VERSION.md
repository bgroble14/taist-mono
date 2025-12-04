# 🚨 QUICK FIX: Version Outdated Issue

## Immediate Fix (Run This Now)

### Option 1: Update Database via Railway CLI (Fastest)

```bash
# Connect to Railway staging
railway run --environment staging php artisan tinker

# Then run:
DB::table('versions')->updateOrInsert(
    ['id' => 1],
    ['version' => '29.0.0', 'updated_at' => now(), 'created_at' => now()]
);

# Verify:
DB::table('versions')->first();
# Should show version: 29.0.0

# Exit tinker
exit
```

### Option 2: Use Railway Dashboard

1. Go to Railway dashboard → Your project → MySQL database
2. Click "Query" tab
3. Run this SQL:
```sql
UPDATE versions SET version = '29.0.0' WHERE id = 1;
-- If no record exists:
INSERT INTO versions (id, version, created_at, updated_at) 
VALUES (1, '29.0.0', NOW(), NOW());
```

### Option 3: Use the Fix Script

```bash
railway run --environment staging bash < scripts/fix-version-now.sh
```

## Verify It's Fixed

### Test the API endpoint:
```bash
curl https://taist-mono-staging.up.railway.app/mapi/get-version
```

Should return:
```json
{
  "success": 1,
  "data": [
    {
      "id": 1,
      "version": "29.0.0",
      ...
    }
  ]
}
```

## Debug iOS Logs

### Option 1: Xcode Console (Best)
1. Connect iPhone to Mac
2. Open Xcode → Window → Devices and Simulators
3. Select your device
4. Click "Open Console"
5. Filter by "Taist" or look for version-related logs

### Option 2: React Native Debugger
1. Shake device → "Debug"
2. Open Chrome DevTools
3. Check Console tab for version logs

### Option 3: Metro Bundler Logs
The terminal running `npm run dev:staging` shows console.log output

### Option 4: Add More Logging
In `frontend/app/screens/common/splash/index.tsx` around line 130:

```typescript
const versionResponse = await GETVERSIONAPICALL();
console.log('🔍 VERSION DEBUG:', {
  apiVersion: versionResponse?.data?.[0]?.version,
  appVersion: CURRENT_VERSION,
  match: versionResponse?.data?.[0]?.version === CURRENT_VERSION,
  fullResponse: versionResponse
});
```

## Why This Happened

The `VersionSeeder` isn't running automatically on Railway deployments. The Procfile has been updated to fix this, but you need to manually update the database first.

## Long-term Fix

After you fix it manually, push the updated Procfile and VERSION file:

```bash
git add backend/Procfile backend/VERSION
git commit -m "Fix version seeder to run automatically"
git push origin main
```

Future deployments will automatically sync the version.

