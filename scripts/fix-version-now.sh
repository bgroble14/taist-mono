#!/bin/bash

# Quick fix script to update version in Railway database
# Usage: railway run --environment staging bash < scripts/fix-version-now.sh

echo "=== Fixing Version in Database ==="

# Update version directly in database
php artisan tinker --execute="
DB::table('versions')->updateOrInsert(
    ['id' => 1],
    ['version' => '29.0.0', 'updated_at' => now(), 'created_at' => now()]
);
echo 'Version updated to 29.0.0';
"

# Verify it worked
php artisan tinker --execute="
\$version = DB::table('versions')->first();
echo 'Current version in database: ' . (\$version ? \$version->version : 'NOT FOUND');
"

echo "=== Done ==="

