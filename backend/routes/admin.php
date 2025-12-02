<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// ============== admin routes ================

Route::get('/', function() {
    if (is_null(Auth::guard('admin')->user())) {
        return view('admin.login');
    }
    return redirect()->route('admin.chefs');
});

Route::get('login', 'LoginController@viewLogin')->name('viewlogin');
Route::post('login', 'LoginController@login')->name('login');

Route::group([ 'middleware' => [ 'auth:admin', ], ], function () {
	Route::get('logout', 'LoginController@logout')->name('logout');
    
    Route::get('chefs', 'AdminController@chefs')->name('chefs');
    Route::get('pendings', 'AdminController@pendings')->name('pendings');
    Route::get('categories', 'AdminController@categories')->name('categories');
    Route::get('menus', 'AdminController@menus')->name('menus');
    Route::get('menus/{id}', 'AdminController@editMenu')->name('menus_edit');
    Route::post('menus/{id}', 'AdminController@updateMenu')->name('menus_update');
    Route::get('customizations', 'AdminController@customizations')->name('customizations');
    Route::get('customizations/{id}', 'AdminController@editCustomizations')->name('customizations_edit');
    Route::post('customizations/{id}', 'AdminController@updateCustomizations')->name('customizations_update');
    Route::get('profiles', 'AdminController@profiles')->name('profiles');
    Route::get('profiles/{id}', 'AdminController@editProfiles')->name('profiles_edit');
    Route::post('profiles/{id}', 'AdminController@updateProfiles')->name('profiles_update');
    Route::get('earnings', 'AdminController@earnings')->name('earnings');
    Route::get('customers', 'AdminController@customers')->name('customers');
    Route::get('notifications', 'AdminController@notifications')->name('notifications');
    Route::get('chats', 'AdminController@chats')->name('chats');
    Route::get('orders', 'AdminController@orders')->name('orders');
    Route::get('reviews', 'AdminController@reviews')->name('reviews');
    Route::get('contacts', 'AdminController@contacts')->name('contacts');
    Route::get('transactions', 'AdminController@transactions')->name('transactions');

    Route::get('zipcodes', 'AdminController@zipcodes')->name('zipcodes');
    Route::post('zipcodes', 'AdminController@updateZipcodes')->name('zipcodes');
    
    // Discount Codes
    Route::get('discount-codes', 'AdminController@discountCodes')->name('discount_codes');
    Route::post('discount-codes', 'AdminController@createDiscountCode')->name('discount_codes_create');
    Route::put('discount-codes/{id}', 'AdminController@updateDiscountCode')->name('discount_codes_update');
    Route::post('discount-codes/{id}/deactivate', 'AdminController@deactivateDiscountCode')->name('discount_codes_deactivate');
    Route::post('discount-codes/{id}/activate', 'AdminController@activateDiscountCode')->name('discount_codes_activate');
    Route::get('discount-codes/{id}/usage', 'AdminController@viewDiscountCodeUsage')->name('discount_codes_usage');
    
    Route::get('export_chefs', 'AdminController@exportChefs')->name('export_chefs');
    Route::get('export_pendings', 'AdminController@exportPendings')->name('export_pendings');
    Route::get('export_customers', 'AdminController@exportCustomers')->name('export_customers');
});