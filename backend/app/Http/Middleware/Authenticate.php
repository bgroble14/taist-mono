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
        // API routes should return null (triggers JSON 401 response)
        if ($request->expectsJson() || strpos($request->getRequestUri(), '/mapi/') !== false) {
            return null;
        }

        // Admin routes redirect to admin login
        if (strpos($request->getRequestUri(), '/admin/') !== false) {
            return route('admin.login');
        }

        // Web routes - but 'login' route doesn't exist, so return null
        // This prevents the RouteNotFoundException
        return null;
    }
}
