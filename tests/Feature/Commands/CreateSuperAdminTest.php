<?php

use App\Models\User;

beforeEach(function () {
    // Clear existing users to ensure clean test state
    User::query()->delete();
});

test('can create super admin with valid input', function () {
    $this->artisan('x:create-super-admin')
        ->expectsQuestion('What is the name of the super admin?', 'Super Admin')
        ->expectsQuestion('What is the email of the super admin?', 'admin@example.com')
        ->expectsQuestion('What is the password of the super admin?', 'password123')
        ->expectsOutput('Super admin created successfully.')
        ->assertExitCode(0);

    // Verify user was created
    $user = User::where('email', 'admin@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('Super Admin');
    expect($user->email)->toBe('admin@example.com');
    expect($user->email_verified_at)->not->toBeNull();
});

test('fails with invalid email format', function () {
    $this->artisan('x:create-super-admin')
        ->expectsQuestion('What is the name of the super admin?', 'Super Admin')
        ->expectsQuestion('What is the email of the super admin?', 'invalid-email')
        ->expectsQuestion('What is the password of the super admin?', 'password123')
        ->expectsOutput('Invalid email format.')
        ->assertExitCode(1);

    // Verify no user was created
    expect(User::count())->toBe(0);
});

test('fails when email already exists', function () {
    // Create an existing user
    User::factory()->create(['email' => 'admin@example.com']);

    $this->artisan('x:create-super-admin')
        ->expectsQuestion('What is the name of the super admin?', 'Super Admin')
        ->expectsQuestion('What is the email of the super admin?', 'admin@example.com')
        ->expectsQuestion('What is the password of the super admin?', 'password123')
        ->expectsOutput('Email already exists.')
        ->assertExitCode(1);

    // Verify only one user exists (the original one)
    expect(User::count())->toBe(1);
});

test('creates user with encrypted password', function () {
    $this->artisan('x:create-super-admin')
        ->expectsQuestion('What is the name of the super admin?', 'Super Admin')
        ->expectsQuestion('What is the email of the super admin?', 'admin@example.com')
        ->expectsQuestion('What is the password of the super admin?', 'password123')
        ->expectsOutput('Super admin created successfully.')
        ->assertExitCode(0);

    $user = User::where('email', 'admin@example.com')->first();
    expect($user->password)->not->toBe('password123');
    expect(password_verify('password123', $user->password))->toBeTrue();
});
