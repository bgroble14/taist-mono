<?php

namespace App\Services;

use App\Listener;
use Illuminate\Support\Facades\Log;

/**
 * ChefAutoOfflineService
 *
 * Automatically toggles chefs offline when their online_until time has passed
 * TMA-011 Phase 5
 */
class ChefAutoOfflineService
{
    /**
     * Find and toggle offline chefs whose online_until time has passed
     *
     * @return int Number of chefs toggled offline
     */
    public function processAutoOffline()
    {
        $now = time();

        // Find all chefs who are online with online_until in the past
        $chefsToToggleOff = app(Listener::class)
            ->where('user_type', 2)
            ->where('is_online', true)
            ->whereNotNull('online_until')
            ->get()
            ->filter(function ($chef) use ($now) {
                $untilTime = strtotime($chef->online_until);
                return $untilTime > 0 && $untilTime <= $now;
            });

        $count = 0;
        foreach ($chefsToToggleOff as $chef) {
            app(Listener::class)->where('id', $chef->id)->update([
                'is_online' => false,
                'online_start' => null,
                'online_until' => null,
                'last_toggled_offline_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Chef auto-toggled offline', [
                'chef_id' => $chef->id,
                'chef_name' => $chef->first_name . ' ' . $chef->last_name,
                'online_until' => $chef->online_until,
                'timestamp' => now()
            ]);

            $count++;
        }

        return $count;
    }
}
