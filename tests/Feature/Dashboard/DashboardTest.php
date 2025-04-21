<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(config('x-dash.prefix'))->assertRedirect(config('x-dash.prefix').'/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(config('x-dash.prefix'))->assertOk();
});
