<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class UpdateAppliancesTable extends Migration
{
    /**
     * Run the migrations.
     * Updates appliances to: Sink, Stove, Oven, Microwave, Charcoal Grill, Gas Grill
     * Removes: Air Fryer, Instant Pot
     *
     * @return void
     */
    public function up()
    {
        $timestamp = date('Y-m-d H:i:s');

        // Clear existing appliances
        DB::table('tbl_appliances')->truncate();

        // Insert new appliances in correct order
        DB::table('tbl_appliances')->insert([
            ['id' => 1, 'name' => 'Sink', 'image' => 'sink.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 2, 'name' => 'Stove', 'image' => 'stove.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 3, 'name' => 'Oven', 'image' => 'oven.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 4, 'name' => 'Microwave', 'image' => 'microwave.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 5, 'name' => 'Charcoal Grill', 'image' => 'charcoal_grill.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 6, 'name' => 'Gas Grill', 'image' => 'gas_grill.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
        ]);

        echo "Appliances updated: Sink, Stove, Oven, Microwave, Charcoal Grill, Gas Grill\n";
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $timestamp = date('Y-m-d H:i:s');

        // Restore original appliances
        DB::table('tbl_appliances')->truncate();

        DB::table('tbl_appliances')->insert([
            ['id' => 1, 'name' => 'Oven', 'image' => 'oven.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 2, 'name' => 'Microwave', 'image' => 'microwave.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 3, 'name' => 'Stovetop', 'image' => 'stovetop.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 4, 'name' => 'Air Fryer', 'image' => 'airfryer.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 5, 'name' => 'Instant Pot', 'image' => 'instantpot.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['id' => 6, 'name' => 'Grill', 'image' => 'grill.png', 'created_at' => $timestamp, 'updated_at' => $timestamp],
        ]);
    }
}
