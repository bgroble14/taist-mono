<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDiscountCodeUsageTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_discount_code_usage', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('discount_code_id')->comment('FK to tbl_discount_codes');
            $table->unsignedBigInteger('order_id')->comment('FK to tbl_orders');
            $table->unsignedBigInteger('customer_user_id')->comment('FK to tbl_users');
            $table->decimal('discount_amount', 10, 2)->comment('Actual discount applied');
            $table->decimal('order_total_before_discount', 10, 2)->comment('Original order total');
            $table->decimal('order_total_after_discount', 10, 2)->comment('Final order total');
            $table->timestamp('used_at')->useCurrent();
            
            // Indexes
            $table->index('discount_code_id', 'idx_discount_code');
            $table->index('order_id', 'idx_order');
            $table->index('customer_user_id', 'idx_customer');
            
            // Foreign Keys
            $table->foreign('discount_code_id', 'fk_usage_discount_code')
                ->references('id')
                ->on('tbl_discount_codes')
                ->onDelete('cascade');
            
            $table->foreign('order_id', 'fk_usage_order')
                ->references('id')
                ->on('tbl_orders')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_discount_code_usage');
    }
}

