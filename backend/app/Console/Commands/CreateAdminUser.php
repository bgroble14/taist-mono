<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Admins;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create 
                            {--email=admin@taist.com : Admin email address}
                            {--password=password : Admin password}
                            {--first-name=Admin : First name}
                            {--last-name=User : Last name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin user account';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');
        $firstName = $this->option('first-name');
        $lastName = $this->option('last-name');

        // Check if admin already exists
        $existingAdmin = Admins::where('email', $email)->first();
        if ($existingAdmin) {
            $this->error("Admin with email '{$email}' already exists!");
            if (!$this->confirm('Do you want to update the password?', false)) {
                return 1;
            }
            
            $existingAdmin->password = $password; // Will be hashed by mutator
            $existingAdmin->active = 1;
            $existingAdmin->save();
            
            $this->info("✅ Admin password updated successfully!");
            $this->line("Email: {$email}");
            $this->line("Password: {$password}");
            return 0;
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

        $this->info("✅ Admin user created successfully!");
        $this->line("");
        $this->line("Login Credentials:");
        $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->line("Email:    {$email}");
        $this->line("Password: {$password}");
        $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->line("");
        $this->info("You can now login at: /admin/login");

        return 0;
    }
}

