<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->date('order_date_new')->nullable()->after('order_date');
            $table->string('order_time', 5)->nullable()->after('order_date_new');  // "HH:MM"
            $table->string('order_timezone', 50)->nullable()->after('order_time');
            $table->unsignedBigInteger('order_timestamp')->nullable()->after('order_timezone');
            $table->index('order_timestamp');
        });
    }

    public function down()
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropIndex(['order_timestamp']);
            $table->dropColumn(['order_date_new', 'order_time', 'order_timezone', 'order_timestamp']);
        });
    }
};
