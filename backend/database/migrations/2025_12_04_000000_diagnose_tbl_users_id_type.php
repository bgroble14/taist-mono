<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Diagnostic Migration - Check tbl_users.id actual type
 *
 * This will tell us what type tbl_users.id ACTUALLY is in the Railway database.
 * We've been guessing it's BIGINT UNSIGNED but maybe it's not.
 */
class DiagnoseTblUsersIdType extends Migration
{
    public function up()
    {
        // Query MySQL to get the ACTUAL column definition
        $result = DB::select("
            SELECT
                COLUMN_NAME,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'tbl_users'
            AND COLUMN_NAME = 'id'
        ");

        if (!empty($result)) {
            $column = $result[0];
            $message = sprintf(
                "tbl_users.id type: %s, nullable: %s, key: %s, extra: %s",
                $column->COLUMN_TYPE,
                $column->IS_NULLABLE,
                $column->COLUMN_KEY,
                $column->EXTRA
            );

            // Log it
            Log::info($message);

            // Also write to a file so we can see it
            file_put_contents(
                storage_path('logs/tbl_users_id_type.txt'),
                $message . "\n",
                FILE_APPEND
            );

            // Echo to console
            echo "\n\n";
            echo "====================================\n";
            echo "DIAGNOSTIC RESULT:\n";
            echo $message . "\n";
            echo "====================================\n\n";
        } else {
            echo "\n\nERROR: tbl_users table not found!\n\n";
        }

        // Don't actually create anything - this is just diagnostic
    }

    public function down()
    {
        // Nothing to rollback
    }
}
