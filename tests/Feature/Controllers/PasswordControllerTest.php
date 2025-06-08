<?php

use App\Models\Password;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('password index includes expiry filters in response', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('passwords.index', [
        'expiry_filter' => 'expired',
    ]));

    $response->assertStatus(200);

    $filters = $response->viewData('page')['props']['filters'];

    expect($filters)->toHaveKey('expiryFilter')
        ->and($filters['expiryFilter'])->toBe('expired');
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
        'expiry_filter' => 'expired',
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
        'expiry_filter' => 'expires_soon',
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

    // Default should be 'all' for expiry filter
    expect($filters['expiryFilter'])->toBe('all');

    // Should show all passwords by default
    expect($passwordIds)
        ->toContain($expired->id)
        ->toContain($expiresSoon->id);
});
