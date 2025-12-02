<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddForeignKeyToDiscountUsageIfMissing extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration adds the foreign key constraint to tbl_orders if it doesn't exist yet.
     * This handles the case where the initial migration ran before the database import.
     *
     * @return void
     */
    public function up()
    {
        // Only proceed if both tables exist
        if (!Schema::hasTable('tbl_discount_code_usage') || !Schema::hasTable('tbl_orders')) {
            return;
        }

        // Check if the foreign key already exists
        $foreignKeyExists = DB::select(
            "SELECT CONSTRAINT_NAME
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'tbl_discount_code_usage'
             AND CONSTRAINT_NAME = 'fk_usage_order'
             AND CONSTRAINT_TYPE = 'FOREIGN KEY'"
        );

        // Add the foreign key only if it doesn't exist
        if (empty($foreignKeyExists)) {
            Schema::table('tbl_discount_code_usage', function (Blueprint $table) {
                $table->foreign('order_id', 'fk_usage_order')
                    ->references('id')
                    ->on('tbl_orders')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('tbl_discount_code_usage')) {
            Schema::table('tbl_discount_code_usage', function (Blueprint $table) {
                // Check if foreign key exists before trying to drop it
                $foreignKeyExists = DB::select(
                    "SELECT CONSTRAINT_NAME
                     FROM information_schema.TABLE_CONSTRAINTS
                     WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = 'tbl_discount_code_usage'
                     AND CONSTRAINT_NAME = 'fk_usage_order'
                     AND CONSTRAINT_TYPE = 'FOREIGN KEY'"
                );

                if (!empty($foreignKeyExists)) {
                    $table->dropForeign('fk_usage_order');
                }
            });
        }
    }
}
