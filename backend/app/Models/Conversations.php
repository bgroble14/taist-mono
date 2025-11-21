<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversations extends Model
{
    protected $table= 'tbl_conversations';

    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }
}