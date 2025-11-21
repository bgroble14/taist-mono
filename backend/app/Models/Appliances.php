<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appliances extends Model
{
    protected $table= 'tbl_appliances';

    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }
}