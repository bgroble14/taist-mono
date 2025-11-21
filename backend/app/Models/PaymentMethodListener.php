<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethodListener extends Model
{
    protected $table= 'tbl_payment_method_listener';
    
    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }

}