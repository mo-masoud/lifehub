<?php

use App\Models\Password;
use App\Models\User;
use App\Notifications\PasswordExpired;
use Tests\TestCase;

uses(TestCase::class);
uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

it('has correct notification type', function () {
    $user = User::factory()->create();
    $password = Password::factory()->expired()->create(['user_id' => $user->id]);

    $notification = new PasswordExpired($password);

    expect($notification->databaseType($user))->toBe('password-expired');
});

it('delivers via database channel', function () {
    $user = User::factory()->create();
    $password = Password::factory()->expired()->create(['user_id' => $user->id]);

    $notification = new PasswordExpired($password);

    expect($notification->via($user))->toBe(['database']);
});

it('creates correct array representation', function () {
    $user = User::factory()->create();
    $password = Password::factory()->expired()->create([
        'user_id' => $user->id,
        'name' => 'Test Password',
        'expires_at' => now()->subDays(5),
    ]);

    $notification = new PasswordExpired($password);
    $array = $notification->toArray($user);

    expect($array)->toHaveKeys(['password_id', 'title', 'message'])
        ->and($array['password_id'])->toBe($password->id)
        ->and($array['title'])->toBe('Password Expired')
        ->and($array['message'])->toContain('Test Password')
        ->and($array['message'])->toContain('has expired');
});

it('should send when password is expired', function () {
    $user = User::factory()->create();
    $password = Password::factory()->expired()->create(['user_id' => $user->id]);

    $notification = new PasswordExpired($password);

    expect($notification->shouldSend($user, 'database'))->toBeTrue();
});

it('should not send when password is not expired', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create([
        'user_id' => $user->id,
        'expires_at' => now()->addDays(30),
    ]);

    $notification = new PasswordExpired($password);

    expect($notification->shouldSend($user, 'database'))->toBeFalse();
});

it('should not send when password has no expiration date', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create([
        'user_id' => $user->id,
        'expires_at' => null,
    ]);

    $notification = new PasswordExpired($password);

    expect($notification->shouldSend($user, 'database'))->toBeFalse();
});
