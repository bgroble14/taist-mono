# Fix Version in Railway Database

## Option 1: Railway Dashboard (Easiest - Do This Now)

1. Go to https://railway.app/
2. Select your project → **staging** environment
3. Click on your **MySQL database service**
4. Click the **"Query"** tab
5. Paste and run this SQL:

```sql
UPDATE versions SET version = '29.0.0', updated_at = NOW() WHERE id = 1;

-- If the record doesn't exist, run this instead:
INSERT INTO versions (id, version, created_at, updated_at) 
VALUES (1, '29.0.0', NOW(), NOW())
ON DUPLICATE KEY UPDATE version = '29.0.0', updated_at = NOW();

-- Verify it worked:
SELECT * FROM versions;
```

6. Should show version: `29.0.0`

## Option 2: Railway CLI (After linking project)

If you have Railway CLI linked to your project:

```bash
# First, link to your project (one-time setup)
railway link

# Then run the update command
railway run php artisan version:update 29.0.0
```

## Option 3: Add to Procfile (Automatic on next deploy)

The command is already created at `backend/app/Console/Commands/UpdateVersion.php`

You can add this to your Procfile temporarily:
```
web: sleep 10 && php artisan railway:fix-migrations && php artisan migrate --force && php artisan version:update 29.0.0 && php artisan db:seed --class=VersionSeeder && php artisan serve --host=0.0.0.0 --port=$PORT
```

But **Option 1 (Dashboard) is fastest** - do that now!

## Verify It's Fixed

Test the API:
```bash
curl https://taist-mono-staging.up.railway.app/mapi/get-version
```

Should return:
```json
{
  "success": 1,
  "data": [{"id": 1, "version": "29.0.0", ...}]
}
```

