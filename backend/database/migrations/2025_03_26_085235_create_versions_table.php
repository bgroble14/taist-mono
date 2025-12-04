<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateVersionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('versions', function (Blueprint $table) {
            $table->id();
            $table->string('version')->default('29.0.0');
            $table->timestamps();
        });

        // Always sync version from config on migration run
        // This ensures the database version matches the app version on every deploy
        $currentVersion = config('version.version', '29.0.0');
        
        $existingRecord = DB::table('versions')->where('id', 1)->first();
        
        DB::table('versions')->updateOrInsert(
            ['id' => 1],
            [
                'version' => $currentVersion,
                'created_at' => $existingRecord->created_at ?? now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('versions');
    }
}
