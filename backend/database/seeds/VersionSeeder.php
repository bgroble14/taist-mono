<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This ensures the version table has the correct version.
     *
     * @return void
     */
    public function run()
    {
        // Get version from config (single source of truth)
        $currentVersion = config('version.version', '29.0.0');
        
        // Check if version record exists
        $existingVersion = DB::table('versions')->first();

        if ($existingVersion) {
            // Update existing record to current version
            DB::table('versions')
                ->where('id', $existingVersion->id)
                ->update([
                    'version' => $currentVersion,
                    'updated_at' => now()
                ]);

            $this->command->info("Version updated to {$currentVersion}");
        } else {
            // Insert new version record
            DB::table('versions')->insert([
                'version' => $currentVersion,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $this->command->info("Version {$currentVersion} inserted");
        }
    }
}
