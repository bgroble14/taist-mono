<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
// use Laravel\Passport\HasApiTokens;
// use Carbon;

class Listener extends Authenticatable
{
    protected $table = 'tbl_users';

    use Notifiable;//, HasApiTokens;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'first_name', 'last_name', 'email', 'password', 'phone', 'birthday', 'address', 'city', 'state', 'zip', 'user_type', 'is_pending', 'verified', 'photo', 'api_token', 'code', 'token_date', 'applicant_guid', 'order_guid', 'fcm_token', 'latitude', 'longitude'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'api_token', 'code'
    ];

    /**
     * Add a mutator to ensure hashed passwords
     */
    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = bcrypt($password);
    }

    public function getCreatedAtAttribute($date)
    {
        return strtotime($date);
    }

    public function getUpdatedAtAttribute($date)
    {
        return strtotime($date);
    }

    function notifications()
    {
        return $this->hasMany(Notification::class,'user_id');
    }

    // public function setCreatedAtAttribute($date)
    // {
    //     $this->attributes['created_at'] = time();
    // }

    // public function setUpdatedAtAttribute($date)
    // {
    //     $this->attributes['updated_at'] = time();
    // }
    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    // protected $casts = [
    //     'email_verified_at' => 'datetime',
    // ];
}
