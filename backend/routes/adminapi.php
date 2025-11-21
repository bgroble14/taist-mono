<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ============== admin api routes ================

Route::group(['middleware' => ['auth:adminapi']], function () {
	Route::post('reset_password', 'AdminapiController@resetPassword');
	Route::get('change_chef_status', 'AdminapiController@changeChefStatus');
	Route::get('change_ticket_status', 'AdminapiController@changeTicketStatus');
	Route::get('change_category_status', 'AdminapiController@changeCategoryStatus');
	Route::post('delete_stripe_accounts', 'AdminapiController@deleteStripeAccounts');

});
