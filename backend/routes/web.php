<?php

use Illuminate\Support\Facades\Route;
use App\Models\Admins;
use Illuminate\Support\Facades\Hash;

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

// Temporary route to create admin user (remove after use!)
Route::get('/create-admin', function () {
    // Simple security check - you can remove this after creating admin
    $secret = request()->get('secret');
    if ($secret !== env('ADMIN_CREATE_SECRET', 'change-this-secret')) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $email = request()->get('email', 'admin@taist.com');
    $password = request()->get('password', 'password');
    $firstName = request()->get('first_name', 'Admin');
    $lastName = request()->get('last_name', 'User');

    // Check if admin already exists
    $existingAdmin = Admins::where('email', $email)->first();
    if ($existingAdmin) {
        $existingAdmin->password = $password; // Will be hashed by mutator
        $existingAdmin->active = 1;
        $existingAdmin->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Admin password updated',
            'email' => $email,
            'password' => $password
        ]);
    }

    // Create new admin
    $admin = Admins::create([
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $email,
        'password' => $password, // Will be hashed by mutator
        'active' => 1,
        'created_at' => time(),
        'updated_at' => time(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Admin user created successfully',
        'email' => $email,
        'password' => $password,
        'login_url' => url('/admin/login')
    ]);
});
