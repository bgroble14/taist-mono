# Railway Setup - First Time Setup

Before copying your database to Railway, you need to link your Railway project.

## Step 1: Link Railway Project

Run this command in your terminal (it requires interactive input):

```bash
cd /Users/williamgroble/taist-mono
railway link
```

You'll be prompted to:
1. Select your workspace (e.g., "taistapp's Projects")
2. Select your project

After linking, Railway will remember your project for future commands.

## Step 2: Verify Link

```bash
railway status
```

This should show your linked project.

## Step 3: Set Environment (if needed)

```bash
railway environment use staging
```

## Step 4: Now You Can Use Railway Commands

After linking, you can use:
- `railway connect mysql --environment staging` - Connect to MySQL
- `railway variables --environment staging` - View environment variables
- `railway run --environment staging <command>` - Run commands in Railway

---

## Alternative: Direct Connection (Without Railway CLI)

If you prefer not to use Railway CLI, you can connect directly using the connection details you provided:

### Option A: Use Railway TCP Proxy URL

From your Railway variables:
- `MYSQL_PUBLIC_URL="mysql://root:FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/railway"`

You'll need to:
1. Get the actual `RAILWAY_TCP_PROXY_DOMAIN` and `RAILWAY_TCP_PROXY_PORT` values from Railway dashboard
2. Use those in the connection string

### Option B: Use Railway Private Domain

From your Railway variables:
- `MYSQL_URL="mysql://root:FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe@${{RAILWAY_PRIVATE_DOMAIN}}:3306/railway"`

This requires getting `RAILWAY_PRIVATE_DOMAIN` from Railway dashboard.

---

## Quick Test Connection

Once linked, test the connection:

```bash
# Start proxy (in one terminal)
railway connect mysql --environment staging

# Test connection (in another terminal)
mysql -h 127.0.0.1 -P 3306 -u root -pFPFWmAogihfsrnuQjyyBWkdqPJTMaKQe railway -e "SELECT 1;"
```

If this works, you're ready to copy your database!

