#!/bin/bash

# Script to safely import local database to Railway
# This preserves the migrations table so Railway doesn't try to re-run migrations

set -e

echo "=========================================="
echo "Railway Database Import Script"
echo "=========================================="
echo ""

# Step 1: Export local database
echo "Step 1: Exporting local database..."
mysqldump -u root -p taist_local > /tmp/local_backup.sql
echo "✓ Local database exported to /tmp/local_backup.sql"
echo ""

# Step 2: Import to Railway
echo "Step 2: Importing to Railway..."
echo "From your Railway variables screenshot:"
echo "Host: mysql://root:FPFWmAogihfsrnuQjyyBWkdqPJTMaKQe@mysql.railway.app:20323/railway"
echo ""
echo "Enter Railway MySQL password (from MYSQL_ROOT_PASSWORD or MYSQL_PASSWORD variable):"
read -s RAILWAY_PASSWORD

mysql -h mysql.railway.app -P 20323 -u root -p"$RAILWAY_PASSWORD" railway < /tmp/local_backup.sql
echo "✓ Database imported to Railway"
echo ""

echo "=========================================="
echo "Import Complete!"
echo "=========================================="
echo ""
echo "Your Railway database now has all your local data."
echo "The app should work with your existing data now."
