<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customizations extends Model
{
    protected $table= 'tbl_customizations';

    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }
}