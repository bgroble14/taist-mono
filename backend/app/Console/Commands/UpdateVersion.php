<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateVersion extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'version:update {version=29.0.0}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update the version in the database';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $version = $this->argument('version');
        
        try {
            DB::table('versions')->updateOrInsert(
                ['id' => 1],
                [
                    'version' => $version,
                    'updated_at' => now(),
                    'created_at' => now()
                ]
            );
            
            $versionRecord = DB::table('versions')->first();
            
            if ($versionRecord) {
                $this->info("✅ Version updated successfully!");
                $this->info("Current version in database: {$versionRecord->version}");
                return 0;
            } else {
                $this->error("❌ Version record not found after update");
                return 1;
            }
        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            return 1;
        }
    }
}

