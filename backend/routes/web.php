<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
/*
Route::get('/', function () {
    return view('home');
});
Route::get('/home', function () {
    return view('home');
});
Route::get('/api_doc', function () {
    return view('api_doc');
});
*/

// Stripe Connect redirect endpoints - these redirect back to the app
Route::get('/stripe/complete', function () {
    return redirect('taistexpo://stripe-complete?status=success');
});

Route::get('/stripe/refresh', function () {
    return redirect('taistexpo://stripe-refresh?status=incomplete');
});