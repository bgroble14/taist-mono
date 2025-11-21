<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationTemplates extends Model
{
    protected $table= 'tbl_notification_templates';
    
    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }

}