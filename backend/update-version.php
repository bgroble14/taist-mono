<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Update or insert version
    DB::table('versions')->updateOrInsert(
        ['id' => 1],
        [
            'version' => '29.0.0',
            'updated_at' => now(),
            'created_at' => now()
        ]
    );
    
    // Verify
    $version = DB::table('versions')->first();
    
    if ($version) {
        echo "✅ Version updated successfully!\n";
        echo "Current version in database: {$version->version}\n";
    } else {
        echo "❌ Version record not found after update\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

