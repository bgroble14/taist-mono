<?php

namespace App\Services;

use App\Listener;
use App\Models\Availabilities;
use App\Notification;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Exception;

/**
 * ChefOnlineReminderService
 *
 * Sends reminders to chefs 24 hours before their scheduled availability
 * to prompt them to confirm/toggle online for same-day orders
 * TMA-011 Phase 6
 */
class ChefOnlineReminderService
{
    protected $twilioService;
    protected $firebaseMessaging;

    public function __construct(TwilioService $twilioService)
    {
        $this->twilioService = $twilioService;

        try {
            $this->firebaseMessaging = app('firebase.messaging');
        } catch (\Exception $e) {
            $this->firebaseMessaging = null;
            Log::warning('Firebase not configured: ' . $e->getMessage());
        }
    }

    /**
     * Send reminder to chef to toggle online
     *
     * @param int $chefId
     * @param string $scheduledTime The time they're scheduled (e.g., "2:00 PM")
     * @return bool
     */
    public function sendOnlineReminder($chefId, $scheduledTime)
    {
        $chef = app(Listener::class)->where('id', $chefId)->first();

        if (!$chef) {
            Log::warning("Chef not found for online reminder", ['chef_id' => $chefId]);
            return false;
        }

        // Skip if already online
        if ($chef->is_online) {
            Log::info("Chef already online, skipping reminder", ['chef_id' => $chefId]);
            return false;
        }

        // Skip if we recently sent a reminder (prevent spam)
        if ($chef->last_online_reminder_sent_at) {
            $lastReminderTime = strtotime($chef->last_online_reminder_sent_at);
            $timeSinceLastReminder = time() - $lastReminderTime;

            // Don't send more than once per day (24 hours)
            if ($timeSinceLastReminder < 86400) {
                Log::info("Recently sent reminder, skipping", [
                    'chef_id' => $chefId,
                    'hours_since_last' => round($timeSinceLastReminder / 3600, 1)
                ]);
                return false;
            }
        }

        $title = "Confirm tomorrow's availability";
        $body = "You're scheduled for {$scheduledTime} tomorrow. Confirm now to receive same-day orders.";

        $sent = false;

        // 1. Push notification (if available)
        if ($chef->fcm_token && $this->firebaseMessaging) {
            try {
                $this->sendPushNotification($chef, $title, $body);
                $sent = true;
                Log::info("Sent push notification", ['chef_id' => $chefId]);
            } catch (Exception $e) {
                Log::error("Failed to send push notification", [
                    'chef_id' => $chefId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // 2. SMS notification (primary method for time-sensitive reminders)
        if ($chef->phone) {
            try {
                $this->sendSmsReminder($chef, $scheduledTime);
                $sent = true;
                Log::info("Sent SMS reminder", ['chef_id' => $chefId]);
            } catch (Exception $e) {
                Log::error("Failed to send SMS reminder", [
                    'chef_id' => $chefId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Update reminder timestamp
        if ($sent) {
            app(Listener::class)->where('id', $chefId)->update([
                'last_online_reminder_sent_at' => now()
            ]);
        }

        return $sent;
    }

    /**
     * Send push notification via Firebase
     */
    private function sendPushNotification($chef, $title, $body)
    {
        if (!$this->firebaseMessaging) {
            return;
        }

        $message = CloudMessage::withTarget('token', $chef->fcm_token)
            ->withNotification([
                'title' => $title,
                'body' => $body,
            ])
            ->withData([
                'type' => 'online_reminder',
                'action' => 'toggle_online',
                'chef_id' => (string)$chef->id,
            ]);

        $this->firebaseMessaging->send($message);

        // Save to notifications table
        Notification::create([
            'title' => $title,
            'body' => $body,
            'image' => $chef->photo ?? 'N/A',
            'fcm_token' => $chef->fcm_token,
            'user_id' => $chef->id,
            'role' => 'chef',
        ]);
    }

    /**
     * Send SMS reminder via Twilio
     */
    private function sendSmsReminder($chef, $scheduledTime)
    {
        $message = "Taist: You're scheduled tomorrow at {$scheduledTime}. Confirm now to receive same-day orders. Open app to confirm or adjust.";

        $result = $this->twilioService->sendSMS(
            $chef->phone,
            $message,
            [
                'chef_id' => $chef->id,
                'notification_type' => 'online_reminder',
                'scheduled_time' => $scheduledTime
            ]
        );

        if (!$result['success']) {
            throw new Exception($result['error'] ?? 'Failed to send SMS');
        }
    }

    /**
     * Find chefs who should receive reminders right now
     * (24 hours before their scheduled availability)
     *
     * @return array Array of chef IDs with their scheduled times
     */
    public function findChefsNeedingReminders()
    {
        $currentTime = now();
        $tomorrow = $currentTime->copy()->addDay();
        $tomorrowDayOfWeek = strtolower($tomorrow->format('l')); // monday, tuesday, etc.

        // Get all availabilities
        $availabilities = app(Availabilities::class)->with('user')->get();

        $chefsToRemind = [];

        foreach ($availabilities as $availability) {
            $chef = app(Listener::class)->where('id', $availability->user_id)->first();

            if (!$chef || $chef->user_type != 2) {
                continue;
            }

            // Skip if already online (already confirmed)
            if ($chef->is_online) {
                continue;
            }

            // Check if they have availability for tomorrow
            $startField = $tomorrowDayOfWeek . '_start';
            $endField = $tomorrowDayOfWeek . '_end';

            $scheduledStart = $availability->$startField;
            $scheduledEnd = $availability->$endField;

            if (!$scheduledStart || !$scheduledEnd) {
                continue; // Not available tomorrow
            }

            // Check if we're in the reminder window (24 hours before start)
            // Create tomorrow's scheduled start timestamp
            $tomorrowStartTimestamp = strtotime($tomorrow->format('Y-m-d') . ' ' . $scheduledStart);
            $reminderTime = $tomorrowStartTimestamp - (24 * 60 * 60); // 24 hours before
            $now = time();

            // Send reminder if we're within 5 minutes of the reminder time (24 hours before start)
            // This gives a wider window for the cron job execution
            if (abs($now - $reminderTime) <= 300) { // 5 minute window
                $chefsToRemind[] = [
                    'chef_id' => $chef->id,
                    'scheduled_time' => date('g:i A', $tomorrowStartTimestamp),
                ];
            }
        }

        return $chefsToRemind;
    }
}
