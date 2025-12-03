<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAiTrackingToReviews extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_reviews', function (Blueprint $table) {
            // Review source tracking
            $table->enum('source', ['authentic', 'ai_generated', 'admin_created'])
                  ->default('authentic')
                  ->after('review')
                  ->comment('Origin of review: authentic (customer), ai_generated, or admin_created');

            // Parent review relationship for AI reviews
            $table->unsignedInteger('parent_review_id')
                  ->nullable()
                  ->after('source')
                  ->comment('For AI reviews, links to the authentic review that spawned it');

            // AI generation metadata
            $table->json('ai_generation_params')
                  ->nullable()
                  ->after('parent_review_id')
                  ->comment('JSON storing AI generation metadata (model, variant, focus, etc.)');

            // Indexes for performance
            $table->index('source', 'idx_reviews_source');
            $table->index('parent_review_id', 'idx_reviews_parent');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_reviews', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('idx_reviews_source');
            $table->dropIndex('idx_reviews_parent');

            // Drop columns
            $table->dropColumn([
                'source',
                'parent_review_id',
                'ai_generation_params',
            ]);
        });
    }
}
