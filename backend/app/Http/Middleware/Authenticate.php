<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Redirect;



class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
        // echo (strpos($request->getRequestUri(), '/admin/')!==false);exit;
            // if (strpos($request->getRequestUri(), 'admin') !== false && $request->getRequestUri()!= '/admin/login')
            if (strpos($request->getRequestUri(), '/admin/') !== false)
                return route('admin.login');
            return route('login');
        }
    }
}
