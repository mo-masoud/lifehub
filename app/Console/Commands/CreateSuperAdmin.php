<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'x:create-super-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a super admin user';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->ask('What is the name of the super admin?');
        $email = $this->ask('What is the email of the super admin?');
        $password = $this->secret('What is the password of the super admin?');

        // Validate the email format
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email format.');

            return 1;
        }

        // Check if the email already exists
        if (User::where('email', $email)->exists()) {
            $this->error('Email already exists.');

            return 1;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt($password),
            'email_verified_at' => now(),
        ]);

        $this->info('Super admin created successfully.');

        return 0;
    }
}
