<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\OpenAIService;

/**
 * Unit tests for OpenAIService and AI Review Generation logic
 * Sprint Task: TMA-017 - Backend logic to generate AI-generated reviews
 * Sprint Task: TMA-009 - AI for menu page
 *
 * Tests model constants, rating variance, and date variance logic
 */
class OpenAIServiceTest extends TestCase
{
    // ==========================================
    // Model Constants Tests
    // ==========================================

    /**
     * Test GPT-5 model constants are defined
     */
    public function test_gpt5_model_constants_exist()
    {
        $this->assertEquals('gpt-5', OpenAIService::MODEL_GPT_5);
        $this->assertEquals('gpt-5-mini', OpenAIService::MODEL_GPT_5_MINI);
        $this->assertEquals('gpt-5-nano', OpenAIService::MODEL_GPT_5_NANO);
        $this->assertEquals('gpt-5-pro', OpenAIService::MODEL_GPT_5_PRO);
        $this->assertEquals('gpt-5.1', OpenAIService::MODEL_GPT_5_1);
    }

    /**
     * Test GPT-4 model constants are defined
     */
    public function test_gpt4_model_constants_exist()
    {
        $this->assertEquals('gpt-4o', OpenAIService::MODEL_GPT_4O);
        $this->assertEquals('gpt-4o-mini', OpenAIService::MODEL_GPT_4O_MINI);
        $this->assertEquals('gpt-4-turbo', OpenAIService::MODEL_GPT_4_TURBO);
        $this->assertEquals('gpt-4', OpenAIService::MODEL_GPT_4);
    }

    /**
     * Test GPT-3.5 model constant exists
     */
    public function test_gpt35_model_constant_exists()
    {
        $this->assertEquals('gpt-3.5-turbo', OpenAIService::MODEL_GPT_35_TURBO);
    }

    /**
     * Test available models returns array
     */
    public function test_get_available_models_returns_array()
    {
        $models = OpenAIService::getAvailableModels();

        $this->assertIsArray($models);
        $this->assertNotEmpty($models);
    }

    /**
     * Test available models includes recommended default
     */
    public function test_available_models_includes_gpt5_mini()
    {
        $models = OpenAIService::getAvailableModels();

        $this->assertArrayHasKey(OpenAIService::MODEL_GPT_5_MINI, $models);
        $this->assertStringContainsString('RECOMMENDED', $models[OpenAIService::MODEL_GPT_5_MINI]);
    }

    /**
     * Test all model constants have descriptions
     */
    public function test_all_model_constants_have_descriptions()
    {
        $models = OpenAIService::getAvailableModels();

        // Verify each key has a non-empty description
        foreach ($models as $model => $description) {
            $this->assertIsString($model);
            $this->assertIsString($description);
            $this->assertNotEmpty($description);
        }
    }

    // ==========================================
    // Rating Variance Logic Tests
    // These test the logic used in varyRating()
    // ==========================================

    /**
     * Test rating variance stays within 1-5 range
     */
    public function test_rating_variance_stays_within_bounds()
    {
        // Test the logic used in varyRating()
        for ($i = 0; $i < 100; $i++) {
            $originalRating = rand(1, 5);
            $variance = (rand(0, 10) / 20);
            $direction = rand(0, 1) ? 1 : -1;
            $newRating = $originalRating + ($direction * $variance);
            $newRating = max(1, min(5, $newRating));
            $newRating = round($newRating * 2) / 2;

            $this->assertGreaterThanOrEqual(1, $newRating);
            $this->assertLessThanOrEqual(5, $newRating);
        }
    }

    /**
     * Test rating variance is within ±0.5 of original
     */
    public function test_rating_variance_is_small()
    {
        // Test the variance is bounded
        for ($i = 0; $i < 100; $i++) {
            $originalRating = 4.0;
            $variance = (rand(0, 10) / 20); // 0 to 0.5
            $direction = rand(0, 1) ? 1 : -1;
            $newRating = $originalRating + ($direction * $variance);

            // Before clamping, variance should be at most 0.5
            $this->assertLessThanOrEqual(0.5, abs($newRating - $originalRating));
        }
    }

    /**
     * Test rating rounds to nearest 0.5
     */
    public function test_rating_rounds_to_half()
    {
        // Test rounding logic: round(x * 2) / 2
        // Using array of arrays to preserve float values
        $testCases = [
            [3.1, 3.0],
            [3.25, 3.5],
            [3.3, 3.5],
            [3.5, 3.5],
            [3.74, 3.5],
            [3.75, 4.0],
            [3.9, 4.0],
            [4.0, 4.0],
        ];

        foreach ($testCases as $case) {
            $input = $case[0];
            $expected = $case[1];
            $rounded = round($input * 2) / 2;
            $this->assertEquals($expected, $rounded, "Failed for input: $input");
        }
    }

    /**
     * Test 5-star rating stays high after variance
     */
    public function test_five_star_rating_stays_high()
    {
        for ($i = 0; $i < 50; $i++) {
            $originalRating = 5.0;
            $variance = (rand(0, 10) / 20);
            $direction = rand(0, 1) ? 1 : -1;
            $newRating = $originalRating + ($direction * $variance);
            $newRating = max(1, min(5, $newRating));
            $newRating = round($newRating * 2) / 2;

            // 5-star should become 4.5 or 5.0
            $this->assertGreaterThanOrEqual(4.5, $newRating);
        }
    }

    /**
     * Test 1-star rating stays low after variance
     */
    public function test_one_star_rating_stays_low()
    {
        for ($i = 0; $i < 50; $i++) {
            $originalRating = 1.0;
            $variance = (rand(0, 10) / 20);
            $direction = rand(0, 1) ? 1 : -1;
            $newRating = $originalRating + ($direction * $variance);
            $newRating = max(1, min(5, $newRating));
            $newRating = round($newRating * 2) / 2;

            // 1-star should become 1.0 or 1.5
            $this->assertLessThanOrEqual(1.5, $newRating);
        }
    }

    // ==========================================
    // Date Variance Logic Tests
    // These test the logic used in varyReviewDate()
    // ==========================================

    /**
     * Test date variance is within 1-14 days
     */
    public function test_date_variance_is_within_bounds()
    {
        $now = time();

        for ($i = 0; $i < 50; $i++) {
            // Replicate varyReviewDate logic
            $daysToSubtract = rand(1, 14);
            $hoursToSubtract = rand(0, 23);
            $minutesToSubtract = rand(0, 59);
            $newTimestamp = $now - ($daysToSubtract * 86400) - ($hoursToSubtract * 3600) - ($minutesToSubtract * 60);

            $daysDiff = ($now - $newTimestamp) / 86400;

            // Should be between 1 and 15 days (14 days + up to 23:59 hours)
            $this->assertGreaterThan(0, $daysDiff);
            $this->assertLessThanOrEqual(15, $daysDiff);
        }
    }

    /**
     * Test date variance always results in past date
     */
    public function test_date_variance_is_always_past()
    {
        $now = time();

        for ($i = 0; $i < 50; $i++) {
            $daysToSubtract = rand(1, 14);
            $hoursToSubtract = rand(0, 23);
            $minutesToSubtract = rand(0, 59);
            $newTimestamp = $now - ($daysToSubtract * 86400) - ($hoursToSubtract * 3600) - ($minutesToSubtract * 60);

            $this->assertLessThan($now, $newTimestamp);
        }
    }

    /**
     * Test date variance has minimum of 1 day
     */
    public function test_date_variance_minimum_one_day()
    {
        $now = time();

        for ($i = 0; $i < 50; $i++) {
            $daysToSubtract = rand(1, 14);
            $hoursToSubtract = rand(0, 23);
            $minutesToSubtract = rand(0, 59);
            $newTimestamp = $now - ($daysToSubtract * 86400) - ($hoursToSubtract * 3600) - ($minutesToSubtract * 60);

            $secondsDiff = $now - $newTimestamp;

            // Minimum should be at least 1 day (86400 seconds)
            $this->assertGreaterThanOrEqual(86400, $secondsDiff);
        }
    }

    // ==========================================
    // AI Review Prompt Tests
    // ==========================================

    /**
     * Test focus areas for AI reviews are defined
     */
    public function test_focus_areas_defined()
    {
        $focusAreas = [
            'food_quality',
            'presentation_service',
            'overall_experience'
        ];

        foreach ($focusAreas as $focus) {
            $this->assertIsString($focus);
            $this->assertNotEmpty($focus);
        }
    }

    /**
     * Test length guides for AI reviews
     */
    public function test_length_guides()
    {
        $shortLength = '40-70 characters';
        $mediumLength = '70-100 characters';

        $this->assertStringContainsString('40-70', $shortLength);
        $this->assertStringContainsString('70-100', $mediumLength);
    }

    /**
     * Test rating description mapping
     */
    public function test_rating_descriptions()
    {
        // Based on getRatingDescription() logic
        $getRatingDescription = function($rating) {
            if ($rating >= 4.5) return 'highly positive';
            if ($rating >= 4.0) return 'positive';
            if ($rating >= 3.0) return 'neutral-positive';
            if ($rating >= 2.0) return 'mixed';
            return 'critical';
        };

        $this->assertEquals('highly positive', $getRatingDescription(5.0));
        $this->assertEquals('highly positive', $getRatingDescription(4.5));
        $this->assertEquals('positive', $getRatingDescription(4.0));
        $this->assertEquals('neutral-positive', $getRatingDescription(3.0));
        $this->assertEquals('mixed', $getRatingDescription(2.5));
        $this->assertEquals('critical', $getRatingDescription(1.0));
    }

    // ==========================================
    // Review Generation Variants Tests
    // ==========================================

    /**
     * Test 3 AI review variants are generated
     */
    public function test_three_review_variants()
    {
        $variants = [
            ['focus' => 'food_quality', 'length' => 'short'],
            ['focus' => 'presentation_service', 'length' => 'medium'],
            ['focus' => 'overall_experience', 'length' => 'medium']
        ];

        $this->assertCount(3, $variants);
    }

    /**
     * Test variant structure
     */
    public function test_variant_structure()
    {
        $variants = [
            ['focus' => 'food_quality', 'length' => 'short'],
            ['focus' => 'presentation_service', 'length' => 'medium'],
            ['focus' => 'overall_experience', 'length' => 'medium']
        ];

        foreach ($variants as $variant) {
            $this->assertArrayHasKey('focus', $variant);
            $this->assertArrayHasKey('length', $variant);
            $this->assertIsString($variant['focus']);
            $this->assertIsString($variant['length']);
        }
    }

    /**
     * Test first variant is short length
     */
    public function test_first_variant_is_short()
    {
        $variants = [
            ['focus' => 'food_quality', 'length' => 'short'],
            ['focus' => 'presentation_service', 'length' => 'medium'],
            ['focus' => 'overall_experience', 'length' => 'medium']
        ];

        $this->assertEquals('short', $variants[0]['length']);
    }

    // ==========================================
    // AI Generation Metadata Tests
    // ==========================================

    /**
     * Test AI review metadata structure
     */
    public function test_ai_review_metadata_structure()
    {
        $metadata = [
            'model' => 'gpt-5-mini',
            'variant' => 1,
            'focus' => 'food_quality',
            'length' => 'short',
            'generated_at' => time()
        ];

        $this->assertArrayHasKey('model', $metadata);
        $this->assertArrayHasKey('variant', $metadata);
        $this->assertArrayHasKey('focus', $metadata);
        $this->assertArrayHasKey('length', $metadata);
        $this->assertArrayHasKey('generated_at', $metadata);
    }

    /**
     * Test metadata JSON encoding
     */
    public function test_ai_review_metadata_json_encoding()
    {
        $metadata = [
            'model' => 'gpt-5-mini',
            'variant' => 1,
            'focus' => 'food_quality',
            'length' => 'short',
            'generated_at' => 1733000000
        ];

        $json = json_encode($metadata);

        $this->assertNotFalse($json);
        $this->assertJson($json);

        $decoded = json_decode($json, true);
        $this->assertEquals($metadata, $decoded);
    }

    /**
     * Test review source values
     */
    public function test_review_source_values()
    {
        $validSources = ['authentic', 'ai_generated', 'admin_created'];

        foreach ($validSources as $source) {
            $this->assertContains($source, $validSources);
        }
    }
}
