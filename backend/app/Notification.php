<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'body' ,
        'image',
        'fcm_token',
        'user_id',
        'navigation_id',
        'role',
    ];


    public function user()
    {
        return $this->belongsTo(Listener::class);
    }
}


