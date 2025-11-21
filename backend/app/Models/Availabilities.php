<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Availabilities extends Model
{
    protected $table= 'tbl_availabilities';

    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }
}