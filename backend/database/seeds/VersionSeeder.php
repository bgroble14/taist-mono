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
        // Read version from backend/VERSION file (single source of truth for backend)
        // This file should be kept in sync with frontend/app.json version
        $versionFilePath = base_path('VERSION');
        $version = null;

        // Try reading from VERSION file first (works in Railway)
        if (file_exists($versionFilePath)) {
            $version = trim(file_get_contents($versionFilePath));
            if (empty($version)) {
                $version = null;
            }
        }

        // Fallback: Try reading from app.json (for local development)
        if (!$version) {
            $possiblePaths = [
                base_path('../frontend/app.json'),  // Monorepo structure
                base_path('../../frontend/app.json'), // Alternative monorepo structure
                __DIR__ . '/../../../frontend/app.json', // Relative from seeder
            ];

            foreach ($possiblePaths as $appJsonPath) {
                $version = $this->getVersionFromAppJson($appJsonPath);
                if ($version) {
                    break;
                }
            }
        }

        // Final fallback - use environment variable if available
        if (!$version && env('APP_VERSION')) {
            $version = env('APP_VERSION');
            $this->command->info("✓ Found version from APP_VERSION env: {$version}");
        }
        
        if (!$version) {
            $this->command->error('⚠️  Could not read version from VERSION file, app.json, or APP_VERSION env');
            $this->command->warn('Make sure backend/VERSION file exists and contains the current app version');
            $this->command->info('Tried paths:');
            $this->command->info('  - ' . base_path('VERSION'));
            if (isset($possiblePaths)) {
                foreach ($possiblePaths as $path) {
                    $this->command->info('  - ' . $path);
                }
            }
            $version = '29.0.0';
            $this->command->warn("Using fallback version: {$version}");
        } else {
            $this->command->info("✓ Found version: {$version}");
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
