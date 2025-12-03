<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddQuizCompletedToUsers extends Migration
{
    /**
     * Run the migrations.
     * Adds quiz_completed column to track chef safety quiz completion
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            $table->tinyInteger('quiz_completed')
                  ->default(0)
                  ->comment('0:not completed,1:completed')
                  ->after('is_pending');
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
            $table->dropColumn('quiz_completed');
        });
    }
}
