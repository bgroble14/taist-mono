<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOnlineStatusToUsers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            // Online toggle status
            $table->boolean('is_online')->default(false)->after('fcm_token');

            // When chef will start being available (for future scheduling)
            $table->timestamp('online_start')->nullable()->after('is_online');

            // When chef will auto-toggle offline
            $table->timestamp('online_until')->nullable()->after('online_start');

            // Timestamps for analytics and notifications
            $table->timestamp('last_toggled_online_at')->nullable()->after('online_until');
            $table->timestamp('last_toggled_offline_at')->nullable()->after('last_toggled_online_at');

            // Track if we've sent reminder for current schedule block
            $table->timestamp('last_online_reminder_sent_at')->nullable()->after('last_toggled_offline_at');

            // Index for efficient queries
            $table->index(['user_type', 'is_online'], 'idx_users_type_online');
            $table->index(['online_start'], 'idx_users_online_start');
            $table->index(['online_until'], 'idx_users_online_until');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('idx_users_type_online');
            $table->dropIndex('idx_users_online_start');
            $table->dropIndex('idx_users_online_until');

            // Drop columns
            $table->dropColumn([
                'is_online',
                'online_start',
                'online_until',
                'last_toggled_online_at',
                'last_toggled_offline_at',
                'last_online_reminder_sent_at'
            ]);
        });
    }
}
