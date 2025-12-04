<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AvailabilityOverride;
use Illuminate\Support\Facades\Log;

/**
 * Cleanup Old Overrides Command
 *
 * TMA-011 REVISED Phase 7
 *
 * Runs daily to delete old availability override records
 * Keeps database clean by removing overrides older than 7 days
 */
class CleanupOldOverrides extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chef:cleanup-old-overrides {--days=7 : Number of days to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old availability override records (TMA-011)';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $daysToKeep = $this->option('days');
        $cutoffDate = now()->subDays($daysToKeep)->format('Y-m-d');

        $this->info("Cleaning up availability overrides older than {$cutoffDate}...");

        try {
            // Get count before deletion
            $oldOverridesCount = AvailabilityOverride::where('override_date', '<', $cutoffDate)->count();

            if ($oldOverridesCount === 0) {
                $this->info('No old overrides to clean up.');
                Log::info('CleanupOldOverrides: No records to delete');
                return 0;
            }

            $this->info("Found {$oldOverridesCount} old override(s) to delete");

            // Delete old overrides
            $deleted = AvailabilityOverride::where('override_date', '<', $cutoffDate)->delete();

            $this->info("✓ Successfully deleted {$deleted} old override record(s)");

            Log::info('CleanupOldOverrides completed', [
                'cutoff_date' => $cutoffDate,
                'deleted_count' => $deleted
            ]);

            return 0;

        } catch (\Exception $e) {
            $this->error('Error cleaning up old overrides: ' . $e->getMessage());
            Log::error('CleanupOldOverrides error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
