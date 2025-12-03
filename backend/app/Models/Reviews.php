<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reviews extends Model
{
    protected $table = 'tbl_reviews';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'order_id',
        'from_user_id',
        'to_user_id',
        'rating',
        'review',
        'tip_amount',
        'source',
        'parent_review_id',
        'ai_generation_params'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'ai_generation_params' => 'array',
        'rating' => 'float'
    ];

    /**
     * Accessor for created_at to convert to unix timestamp
     */
    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    /**
     * Accessor for updated_at to convert to unix timestamp
     */
    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }

    /**
     * Relationship to parent review (for AI-generated reviews)
     */
    public function parentReview()
    {
        return $this->belongsTo(Reviews::class, 'parent_review_id');
    }

    /**
     * Relationship to AI child reviews (for authentic reviews)
     */
    public function aiReviews()
    {
        return $this->hasMany(Reviews::class, 'parent_review_id');
    }
}