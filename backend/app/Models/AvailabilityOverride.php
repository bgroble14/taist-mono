<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Listener;

/**
 * AvailabilityOverride Model
 *
 * TMA-011 REVISED Phase 2
 *
 * Represents a day-specific availability override for a chef.
 * This overrides the weekly recurring schedule for a specific date only.
 *
 * Relationships:
 * - Belongs to a Chef (Listener/User)
 */
class AvailabilityOverride extends Model
{
    protected $table = 'tbl_availability_overrides';

    protected $fillable = [
        'chef_id',
        'override_date',
        'start_time',
        'end_time',
        'status',
        'source',
    ];

    protected $casts = [
        'override_date' => 'date',
        // start_time and end_time are TIME columns - no casting needed
    ];

    /**
     * Get the chef this override belongs to
     */
    public function chef()
    {
        return $this->belongsTo(Listener::class, 'chef_id', 'id');
    }

    /**
     * Check if this override represents a cancellation (chef not available)
     *
     * @return bool
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled' || ($this->start_time === null && $this->end_time === null);
    }

    /**
     * Check if chef is available at a specific time on this override date
     *
     * @param string $time Time in H:i format (e.g., "14:30")
     * @return bool
     */
    public function isAvailableAt($time)
    {
        // If cancelled, not available
        if ($this->isCancelled()) {
            return false;
        }

        // If no times set, assume available all day
        if (!$this->start_time || !$this->end_time) {
            return true;
        }

        // Convert time strings to timestamps for comparison
        $checkTime = strtotime($time);
        $startTime = strtotime($this->start_time);
        $endTime = strtotime($this->end_time);

        return $checkTime >= $startTime && $checkTime <= $endTime;
    }

    /**
     * Get human-readable status message
     *
     * @return string
     */
    public function getStatusMessage()
    {
        switch ($this->status) {
            case 'confirmed':
                return 'Confirmed for ' . $this->override_date->format('M j, Y');
            case 'modified':
                return 'Modified hours for ' . $this->override_date->format('M j, Y');
            case 'cancelled':
                return 'Not available on ' . $this->override_date->format('M j, Y');
            default:
                return 'Unknown status';
        }
    }

    /**
     * Scope: Get overrides for a specific chef
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $chefId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForChef($query, $chefId)
    {
        return $query->where('chef_id', $chefId);
    }

    /**
     * Scope: Get overrides for a specific date
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $date Date in Y-m-d format
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('override_date', $date);
    }

    /**
     * Scope: Get overrides within a date range
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $startDate
     * @param string $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('override_date', [$startDate, $endDate]);
    }

    /**
     * Scope: Get only active (not cancelled) overrides
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'cancelled');
    }

    /**
     * Scope: Get overrides created from reminder confirmations
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFromReminder($query)
    {
        return $query->where('source', 'reminder_confirmation');
    }

    /**
     * Scope: Get overrides created from manual toggles
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFromManualToggle($query)
    {
        return $query->where('source', 'manual_toggle');
    }
}
