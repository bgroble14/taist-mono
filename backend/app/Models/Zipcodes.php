<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Zipcodes extends Model
{
    protected $table= 'tbl_zipcodes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'zipcodes'
    ];

    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }
}