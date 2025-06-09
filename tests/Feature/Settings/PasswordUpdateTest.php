<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password settings page can be displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/password');

    $response->assertOk();
});

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
});

test('current password must be correct to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->put('/settings/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertSessionHasErrors(['current_password']);
});

test('new password must be confirmed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'different-password',
        ]);

    $response->assertSessionHasErrors(['password']);
});

test('password update requires all fields', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->put('/settings/password', []);

    $response->assertSessionHasErrors(['current_password', 'password']);
});
