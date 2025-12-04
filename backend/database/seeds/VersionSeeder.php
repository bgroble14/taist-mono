<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This ensures the version table has the correct version from app.json.
     * This seeder automatically syncs the database version with the app version.
     *
     * @return void
     */
    public function run()
    {
        // Read version from app.json (single source of truth)
        // Try multiple possible paths to handle different deployment scenarios
        $possiblePaths = [
            base_path('../frontend/app.json'),  // Monorepo structure
            base_path('../../frontend/app.json'), // Alternative monorepo structure
            base_path('frontend/app.json'),      // If frontend is in backend directory
            __DIR__ . '/../../../frontend/app.json', // Relative from seeder
        ];

        $version = null;
        foreach ($possiblePaths as $appJsonPath) {
            $version = $this->getVersionFromAppJson($appJsonPath);
            if ($version) {
                break;
            }
        }

        if (!$version) {
            $this->command->error('Could not read version from app.json. Using fallback version 29.0.0');
            $version = '29.0.0';
        }

        // Check if version record exists
        $existingVersion = DB::table('versions')->first();

        if ($existingVersion) {
            // Update existing record to current version
            DB::table('versions')
                ->where('id', $existingVersion->id)
                ->update([
                    'version' => $version,
                    'updated_at' => now()
                ]);

            $this->command->info("Version updated to {$version}");
        } else {
            // Insert new version record
            DB::table('versions')->insert([
                'version' => $version,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $this->command->info("Version {$version} inserted");
        }
    }

    /**
     * Read version from app.json file
     *
     * @param string $appJsonPath
     * @return string|null
     */
    private function getVersionFromAppJson($appJsonPath)
    {
        if (!file_exists($appJsonPath)) {
            return null;
        }

        $content = file_get_contents($appJsonPath);
        $json = json_decode($content, true);

        return $json['expo']['version'] ?? null;
    }
}
