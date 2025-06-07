<?php

use App\Models\Password;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('password index includes expiry filters in response', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('passwords.index', [
        'show_expired' => '0',
        'show_expires_soon' => '1',
    ]));

    $response->assertStatus(200);

    $filters = $response->viewData('page')['props']['filters'];

    expect($filters)->toHaveKey('showExpired')
        ->and($filters['showExpired'])->toBe(false)
        ->and($filters)->toHaveKey('showExpiresSoon')
        ->and($filters['showExpiresSoon'])->toBe(true);
});

test('password index filters by expiry correctly', function () {
    $this->actingAs($this->user);

    $expired = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(5),
    ]);

    $expiresSoon = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(10),
    ]);

    $notExpiring = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(30),
    ]);

    // Test showing only expired passwords
    $response = $this->get(route('passwords.index', [
        'show_expired' => true,
        'show_expires_soon' => false,
    ]));

    $response->assertStatus(200);

    $passwords = $response->viewData('page')['props']['passwords']['data'];
    $passwordIds = collect($passwords)->pluck('id')->toArray();

    expect($passwordIds)
        ->toContain($expired->id)
        ->not->toContain($expiresSoon->id)
        ->not->toContain($notExpiring->id);

    // Test showing only expiring soon passwords
    $response = $this->get(route('passwords.index', [
        'show_expired' => false,
        'show_expires_soon' => true,
    ]));

    $response->assertStatus(200);

    $passwords = $response->viewData('page')['props']['passwords']['data'];
    $passwordIds = collect($passwords)->pluck('id')->toArray();

    expect($passwordIds)
        ->not->toContain($expired->id)
        ->toContain($expiresSoon->id)
        ->not->toContain($notExpiring->id);
});

test('password index defaults to showing all passwords when no expiry filters provided', function () {
    $this->actingAs($this->user);

    $expired = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(5),
    ]);

    $expiresSoon = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(10),
    ]);

    $response = $this->get(route('passwords.index'));

    $response->assertStatus(200);

    $filters = $response->viewData('page')['props']['filters'];
    $passwords = $response->viewData('page')['props']['passwords']['data'];
    $passwordIds = collect($passwords)->pluck('id')->toArray();

    // Defaults should be true for both filters
    expect($filters['showExpired'])->toBe(true)
        ->and($filters['showExpiresSoon'])->toBe(true);

    // Should show all passwords by default
    expect($passwordIds)
        ->toContain($expired->id)
        ->toContain($expiresSoon->id);
});
