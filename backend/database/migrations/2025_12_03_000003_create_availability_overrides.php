<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create Availability Overrides Table
 *
 * TMA-011 REVISED Phase 1
 *
 * This table stores day-specific availability overrides that take precedence
 * over the weekly recurring schedule in tbl_availabilities.
 *
 * Use cases:
 * 1. Chef confirms/modifies tomorrow's hours via 24-hour reminder
 * 2. Chef manually toggles availability for today/tomorrow (0-36 hours)
 *
 * Key points:
 * - One override per chef per day (unique constraint)
 * - start_time/end_time NULL = cancelled for that day
 * - Does NOT affect weekly recurring schedule
 */
class CreateAvailabilityOverrides extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_availability_overrides', function (Blueprint $table) {
            $table->id();

            // Which chef this override is for
            $table->unsignedBigInteger('chef_id');

            // Which specific date this override applies to (YYYY-MM-DD)
            $table->date('override_date');

            // Override times (NULL = cancelled for this day)
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            // Status: confirmed (same as schedule), modified (changed times), cancelled (not available)
            $table->enum('status', ['confirmed', 'modified', 'cancelled'])->default('confirmed');

            // How was this override created?
            // reminder_confirmation: Chef responded to 24-hour reminder
            // manual_toggle: Chef manually set via toggle API
            $table->enum('source', ['reminder_confirmation', 'manual_toggle'])->default('manual_toggle');

            $table->timestamps();

            // Ensure one override per chef per day
            $table->unique(['chef_id', 'override_date'], 'unique_chef_date');

            // Foreign key to tbl_users table
            $table->foreign('chef_id')
                  ->references('id')
                  ->on('tbl_users')
                  ->onDelete('cascade');

            // Index for querying by date range
            $table->index('override_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_availability_overrides');
    }
}
