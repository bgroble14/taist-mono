<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Allergens extends Model
{
    protected $table= 'tbl_allergens';

    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }
}