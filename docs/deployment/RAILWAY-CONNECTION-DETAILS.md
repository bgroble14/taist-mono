# How to Get Railway MySQL Connection Details

Since `railway connect mysql` isn't detecting your MySQL service, here's how to get the connection details directly from Railway Dashboard.

## Method 1: From Railway Dashboard Variables

1. Go to [Railway Dashboard](https://railway.app)
2. Select your **Taist** project
3. Select **staging** environment
4. Click on your **MySQL service** (MySQL-Y2bE)
5. Go to the **Variables** tab
6. Look for these variables:

### Option A: TCP Proxy (Public Connection)
- `RAILWAY_TCP_PROXY_DOMAIN` - This is your host
- `RAILWAY_TCP_PROXY_PORT` - This is your port

### Option B: Private Domain (Internal Connection)
- `RAILWAY_PRIVATE_DOMAIN` - This is your host (use port 3306)

### Option C: Use MYSQL_PUBLIC_URL
- `MYSQL_PUBLIC_URL` - Contains full connection string
  - Format: `mysql://root:PASSWORD@HOST:PORT/railway`
  - Extract HOST and PORT from this URL

## Method 2: Extract from MYSQL_PUBLIC_URL

If you have `MYSQL_PUBLIC_URL`:
```
mysql://root:FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe@proxy.railway.app:12345/railway
```

Then:
- Host: `proxy.railway.app`
- Port: `12345`
- User: `root`
- Password: `FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe`
- Database: `railway`

## Using the Direct Connection Script

Once you have the host and port, use the direct connection script:

```bash
cd /Users/williamgroble/taist-mono

# Set Railway connection details
export RAILWAY_HOST="your-tcp-proxy-domain.railway.app"  # or private domain
export RAILWAY_PORT="12345"  # or 3306 for private domain
export RAILWAY_DB_NAME="railway"
export RAILWAY_DB_USER="root"
export RAILWAY_DB_PASS="FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe"

# Set local database name
export LOCAL_DB_NAME="taist_local"  # or your actual local DB name

# Run the script
./scripts/copy-local-to-railway-direct.sh
```

## Quick Test Connection

Test if you can connect:

```bash
mysql -h "$RAILWAY_HOST" -P "$RAILWAY_PORT" \
      -u root \
      -pFPFWmAogihfsrnuQjyyBWkdqPJTMaKQe \
      railway \
      -e "SELECT 1 as test;"
```

If this works, you're ready to copy your database!

## Troubleshooting

### "Access denied" error
- Check password is correct
- Verify user is `root`

### "Can't connect to MySQL server" error
- Check host and port are correct
- Verify MySQL service is running in Railway
- For TCP proxy: Make sure your IP is allowed (check Railway service settings)

### "Unknown MySQL server host" error
- Double-check the host domain
- Try using `RAILWAY_PRIVATE_DOMAIN` instead of TCP proxy

