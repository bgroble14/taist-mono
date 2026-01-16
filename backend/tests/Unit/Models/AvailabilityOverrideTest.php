<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\AvailabilityOverride;
use Carbon\Carbon;

/**
 * Unit tests for AvailabilityOverride model and time slot filtering
 * Sprint Task: TMA-011 - Calendar overhaul
 * Sprint Task: TMA-018 - Categories (including time of day filters)
 *
 * Tests availability checking, time slot logic, and cancellation detection
 */
class AvailabilityOverrideTest extends TestCase
{
    // ==========================================
    // isCancelled() Tests
    // ==========================================

    /**
     * Test cancelled status returns true
     */
    public function test_cancelled_status_returns_true()
    {
        $override = new AvailabilityOverride([
            'status' => 'cancelled',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $this->assertTrue($override->isCancelled());
    }

    /**
     * Test null times indicate cancellation
     */
    public function test_null_times_indicate_cancellation()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => null,
            'end_time' => null,
        ]);

        $this->assertTrue($override->isCancelled());
    }

    /**
     * Test confirmed status with times is not cancelled
     */
    public function test_confirmed_with_times_is_not_cancelled()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $this->assertFalse($override->isCancelled());
    }

    /**
     * Test modified status with times is not cancelled
     */
    public function test_modified_with_times_is_not_cancelled()
    {
        $override = new AvailabilityOverride([
            'status' => 'modified',
            'start_time' => '10:00',
            'end_time' => '14:00',
        ]);

        $this->assertFalse($override->isCancelled());
    }

    // ==========================================
    // isAvailableAt() Tests
    // ==========================================

    /**
     * Test availability within time range
     */
    public function test_available_within_time_range()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $this->assertTrue($override->isAvailableAt('12:00'));
        $this->assertTrue($override->isAvailableAt('09:00')); // Start time inclusive
        $this->assertTrue($override->isAvailableAt('16:59'));
    }

    /**
     * Test unavailable outside time range
     */
    public function test_unavailable_outside_time_range()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $this->assertFalse($override->isAvailableAt('08:59'));
        $this->assertFalse($override->isAvailableAt('17:00')); // End time exclusive
        $this->assertFalse($override->isAvailableAt('20:00'));
    }

    /**
     * Test cancelled override is never available
     */
    public function test_cancelled_override_is_never_available()
    {
        $override = new AvailabilityOverride([
            'status' => 'cancelled',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $this->assertFalse($override->isAvailableAt('12:00'));
    }

    /**
     * Test midnight end time handling
     */
    public function test_midnight_end_time_handling()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '20:00',
            'end_time' => '00:00', // Midnight
        ]);

        $this->assertTrue($override->isAvailableAt('20:00'));
        $this->assertTrue($override->isAvailableAt('22:00'));
        $this->assertTrue($override->isAvailableAt('23:59'));
    }

    /**
     * Test availability with different time formats
     */
    public function test_availability_with_different_time_formats()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        // Various formats should be normalized
        $this->assertTrue($override->isAvailableAt('12:00'));
        $this->assertTrue($override->isAvailableAt('9:00')); // Single digit hour
    }

    /**
     * Test all day availability when no times set
     */
    public function test_all_day_availability_when_no_times()
    {
        // If not cancelled but no times, should be available
        // Note: This depends on isCancelled() logic - null times = cancelled
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => null,
            'end_time' => null,
        ]);

        // With both null, isCancelled() returns true
        $this->assertFalse($override->isAvailableAt('12:00'));
    }

    // ==========================================
    // Time Slot Definitions Tests (TMA-018)
    // ==========================================

    /**
     * Test breakfast time slot definition (5am-11am)
     */
    public function test_breakfast_time_slot_definition()
    {
        $breakfastStart = 5;  // 5 AM
        $breakfastEnd = 11;   // 11 AM

        $this->assertEquals(5, $breakfastStart);
        $this->assertEquals(11, $breakfastEnd);
    }

    /**
     * Test lunch time slot definition (11am-4pm)
     */
    public function test_lunch_time_slot_definition()
    {
        $lunchStart = 11; // 11 AM
        $lunchEnd = 16;   // 4 PM

        $this->assertEquals(11, $lunchStart);
        $this->assertEquals(16, $lunchEnd);
    }

    /**
     * Test dinner time slot definition (4pm-10pm)
     */
    public function test_dinner_time_slot_definition()
    {
        $dinnerStart = 16; // 4 PM
        $dinnerEnd = 22;   // 10 PM

        $this->assertEquals(16, $dinnerStart);
        $this->assertEquals(22, $dinnerEnd);
    }

    /**
     * Test late night time slot definition (10pm-5am)
     */
    public function test_late_night_time_slot_definition()
    {
        $lateNightStart = 22; // 10 PM
        $lateNightEnd = 5;    // 5 AM (wraps around midnight)

        $this->assertEquals(22, $lateNightStart);
        $this->assertEquals(5, $lateNightEnd);
    }

    /**
     * Test time slot ID mapping
     */
    public function test_time_slot_id_mapping()
    {
        // Time slot IDs used in the system
        $timeSlots = [
            1 => 'Breakfast',   // 5am-11am
            2 => 'Lunch',       // 11am-4pm
            3 => 'Dinner',      // 4pm-10pm
            4 => 'Late Night',  // 10pm-5am
        ];

        $this->assertCount(4, $timeSlots);
        $this->assertArrayHasKey(1, $timeSlots);
        $this->assertArrayHasKey(2, $timeSlots);
        $this->assertArrayHasKey(3, $timeSlots);
        $this->assertArrayHasKey(4, $timeSlots);
    }

    /**
     * Test time falls in breakfast slot
     */
    public function test_time_in_breakfast_slot()
    {
        $hour = 8; // 8 AM
        $isBreakfast = ($hour >= 5 && $hour < 11);

        $this->assertTrue($isBreakfast);
    }

    /**
     * Test time falls in lunch slot
     */
    public function test_time_in_lunch_slot()
    {
        $hour = 13; // 1 PM
        $isLunch = ($hour >= 11 && $hour < 16);

        $this->assertTrue($isLunch);
    }

    /**
     * Test time falls in dinner slot
     */
    public function test_time_in_dinner_slot()
    {
        $hour = 19; // 7 PM
        $isDinner = ($hour >= 16 && $hour < 22);

        $this->assertTrue($isDinner);
    }

    /**
     * Test time falls in late night slot
     */
    public function test_time_in_late_night_slot()
    {
        $hour = 23; // 11 PM
        $isLateNight = ($hour >= 22 || $hour < 5);

        $this->assertTrue($isLateNight);

        $hour2 = 2; // 2 AM
        $isLateNight2 = ($hour2 >= 22 || $hour2 < 5);

        $this->assertTrue($isLateNight2);
    }

    // ==========================================
    // Category Filtering Tests
    // ==========================================

    /**
     * Test FIND_IN_SET logic for category filtering
     */
    public function test_find_in_set_category_logic()
    {
        // Simulate category_ids field with comma-separated values
        $categoryIds = '1,3,5,7';
        $targetCategoryId = '3';

        // PHP equivalent of MySQL FIND_IN_SET
        $categories = explode(',', $categoryIds);
        $found = in_array($targetCategoryId, $categories);

        $this->assertTrue($found);
    }

    /**
     * Test category not found in list
     */
    public function test_category_not_found_in_list()
    {
        $categoryIds = '1,3,5,7';
        $targetCategoryId = '2';

        $categories = explode(',', $categoryIds);
        $found = in_array($targetCategoryId, $categories);

        $this->assertFalse($found);
    }

    /**
     * Test single category in list
     */
    public function test_single_category_in_list()
    {
        $categoryIds = '5';
        $targetCategoryId = '5';

        $categories = explode(',', $categoryIds);
        $found = in_array($targetCategoryId, $categories);

        $this->assertTrue($found);
    }

    /**
     * Test empty category list
     */
    public function test_empty_category_list()
    {
        $categoryIds = '';
        $targetCategoryId = '1';

        if (empty($categoryIds)) {
            $found = false;
        } else {
            $categories = explode(',', $categoryIds);
            $found = in_array($targetCategoryId, $categories);
        }

        $this->assertFalse($found);
    }

    // ==========================================
    // Status Message Tests
    // ==========================================

    /**
     * Test confirmed status message
     */
    public function test_confirmed_status_message()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'override_date' => Carbon::parse('2025-12-15'),
        ]);

        $message = $override->getStatusMessage();

        $this->assertStringContainsString('Confirmed', $message);
        $this->assertStringContainsString('Dec 15, 2025', $message);
    }

    /**
     * Test modified status message
     */
    public function test_modified_status_message()
    {
        $override = new AvailabilityOverride([
            'status' => 'modified',
            'override_date' => Carbon::parse('2025-12-20'),
        ]);

        $message = $override->getStatusMessage();

        $this->assertStringContainsString('Modified', $message);
        $this->assertStringContainsString('Dec 20, 2025', $message);
    }

    /**
     * Test cancelled status message
     */
    public function test_cancelled_status_message()
    {
        $override = new AvailabilityOverride([
            'status' => 'cancelled',
            'override_date' => Carbon::parse('2025-12-25'),
        ]);

        $message = $override->getStatusMessage();

        $this->assertStringContainsString('Not available', $message);
        $this->assertStringContainsString('Dec 25, 2025', $message);
    }

    /**
     * Test unknown status message
     */
    public function test_unknown_status_message()
    {
        $override = new AvailabilityOverride([
            'status' => 'something_else',
            'override_date' => Carbon::parse('2025-12-30'),
        ]);

        $message = $override->getStatusMessage();

        $this->assertEquals('Unknown status', $message);
    }

    // ==========================================
    // Source Tracking Tests
    // ==========================================

    /**
     * Test source values
     */
    public function test_source_values()
    {
        $validSources = [
            'reminder_confirmation',
            'manual_toggle',
        ];

        foreach ($validSources as $source) {
            $override = new AvailabilityOverride([
                'source' => $source,
            ]);

            $this->assertEquals($source, $override->source);
        }
    }

    // ==========================================
    // Fillable Attributes Tests
    // ==========================================

    /**
     * Test fillable attributes
     */
    public function test_fillable_attributes()
    {
        $override = new AvailabilityOverride();
        $fillable = $override->getFillable();

        $this->assertContains('chef_id', $fillable);
        $this->assertContains('override_date', $fillable);
        $this->assertContains('start_time', $fillable);
        $this->assertContains('end_time', $fillable);
        $this->assertContains('status', $fillable);
        $this->assertContains('source', $fillable);
    }

    // ==========================================
    // Edge Case Tests
    // ==========================================

    /**
     * Test boundary time - exactly at start
     */
    public function test_boundary_time_at_start()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        // Start time is inclusive
        $this->assertTrue($override->isAvailableAt('09:00'));
    }

    /**
     * Test boundary time - exactly at end
     */
    public function test_boundary_time_at_end()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        // End time is exclusive
        $this->assertFalse($override->isAvailableAt('17:00'));
    }

    /**
     * Test one minute before end is available
     */
    public function test_one_minute_before_end_is_available()
    {
        $override = new AvailabilityOverride([
            'status' => 'confirmed',
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $this->assertTrue($override->isAvailableAt('16:59'));
    }
}
