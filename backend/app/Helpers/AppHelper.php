<?php
namespace App\Helpers;

class AppHelper
{
    public function getPhotoURL($url, $is_photo=0) {
        if ($url == "") {
            if ($is_photo == 1)
                return '/assets/images/profile.png';
            return '/assets/images/photo_frame.png';
        }
        return '/assets/uploads/images/'.$url;
    }

    public function generateFlag($c) {
        $c = strtolower($c);
        $c = 'https://www.flagpictures.com/static/flags/vector/'.$c.'.svg';
        return $c;
    }
    
    public static function instance()
    {
        return new AppHelper();
    }
}