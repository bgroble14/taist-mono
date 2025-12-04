<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ChefConfirmationReminderService;
use Illuminate\Support\Facades\Log;

/**
 * Send Confirmation Reminders Command
 *
 * TMA-011 REVISED Phase 7
 *
 * Runs hourly to find chefs who should receive 24-hour confirmation reminders
 * for their next scheduled availability
 */
class SendConfirmationReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chef:send-confirmation-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send 24-hour confirmation reminders to chefs for their next scheduled availability (TMA-011)';

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
        $this->info('Starting chef confirmation reminders...');

        try {
            $reminderService = app(ChefConfirmationReminderService::class);

            // Find chefs needing reminders
            $reminders = $reminderService->findChefsNeedingReminders();

            if (empty($reminders)) {
                $this->info('No chefs need reminders at this time.');
                Log::info('SendConfirmationReminders: No chefs to remind');
                return 0;
            }

            $this->info("Found " . count($reminders) . " chef(s) to remind");

            $successCount = 0;
            $failureCount = 0;

            foreach ($reminders as $reminder) {
                $success = $reminderService->sendConfirmationReminder(
                    $reminder['chef_id'],
                    $reminder['tomorrow_date'],
                    $reminder['scheduled_start'],
                    $reminder['scheduled_end']
                );

                if ($success) {
                    $successCount++;
                    $this->info("✓ Sent reminder to chef {$reminder['chef_id']}");
                } else {
                    $failureCount++;
                    $this->warn("✗ Failed to send reminder to chef {$reminder['chef_id']}");
                }
            }

            $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            $this->info("Summary:");
            $this->info("  ✓ Sent: {$successCount}");
            if ($failureCount > 0) {
                $this->warn("  ✗ Failed: {$failureCount}");
            }

            Log::info('SendConfirmationReminders completed', [
                'total_found' => count($reminders),
                'sent' => $successCount,
                'failed' => $failureCount
            ]);

            return 0;

        } catch (\Exception $e) {
            $this->error('Error sending confirmation reminders: ' . $e->getMessage());
            Log::error('SendConfirmationReminders error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
