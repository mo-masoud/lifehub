<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get(config('x-dash.prefix').'/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(config('x-dash.prefix').'/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard.home', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(config('x-dash.prefix').'/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(config('x-dash.prefix').'/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
