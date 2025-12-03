<?php

namespace App\Services;

use App\Listener;
use Illuminate\Support\Facades\Log;

/**
 * ChefAutoOnlineService
 *
 * Automatically toggles chefs online when their scheduled online_start time arrives
 * TMA-011 Phase 5
 */
class ChefAutoOnlineService
{
    /**
     * Find and toggle online chefs whose online_start time has arrived
     *
     * @return int Number of chefs toggled online
     */
    public function processAutoOnline()
    {
        $now = time();

        // Find all chefs who are scheduled to go online (not yet online, but start time has passed)
        $chefsToToggleOn = app(Listener::class)
            ->where('user_type', 2)
            ->where('is_online', false)
            ->whereNotNull('online_start')
            ->whereNotNull('online_until')
            ->get()
            ->filter(function ($chef) use ($now) {
                $startTime = strtotime($chef->online_start);
                // Only toggle if start time has arrived and is valid
                return $startTime > 0 && $startTime <= $now;
            });

        $count = 0;
        foreach ($chefsToToggleOn as $chef) {
            // Double-check online_until is still in the future
            $untilTime = strtotime($chef->online_until);
            if ($untilTime <= $now) {
                // Schedule expired, clear it instead
                app(Listener::class)->where('id', $chef->id)->update([
                    'online_start' => null,
                    'online_until' => null,
                    'updated_at' => now()
                ]);

                Log::info('Chef schedule expired before start time', [
                    'chef_id' => $chef->id,
                    'online_until' => $chef->online_until
                ]);
                continue;
            }

            // Toggle chef online
            app(Listener::class)->where('id', $chef->id)->update([
                'is_online' => true,
                'last_toggled_online_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Chef auto-toggled online', [
                'chef_id' => $chef->id,
                'chef_name' => $chef->first_name . ' ' . $chef->last_name,
                'online_start' => $chef->online_start,
                'online_until' => $chef->online_until,
                'timestamp' => now()
            ]);

            $count++;
        }

        return $count;
    }
}
