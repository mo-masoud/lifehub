<?php

use App\Models\Password;
use App\Models\User;
use App\Services\PasswordQueryService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = new PasswordQueryService();
});

test('password query service applies expiry filters correctly', function () {
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

    $noExpiry = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => null,
    ]);

    // Test showing only expired
    $expiredResults = $this->service->getFilteredPasswords(
        $this->user,
        ['expiry_filter' => 'expired'],
        false
    );

    expect($expiredResults->pluck('id')->toArray())
        ->toContain($expired->id)
        ->not->toContain($expiresSoon->id)
        ->not->toContain($notExpiring->id)
        ->not->toContain($noExpiry->id);

    // Test showing only expires soon
    $expiresSoonResults = $this->service->getFilteredPasswords(
        $this->user,
        ['expiry_filter' => 'expires_soon'],
        false
    );

    expect($expiresSoonResults->pluck('id')->toArray())
        ->not->toContain($expired->id)
        ->toContain($expiresSoon->id)
        ->not->toContain($notExpiring->id)
        ->not->toContain($noExpiry->id);

    // Test showing all
    $allResults = $this->service->getFilteredPasswords(
        $this->user,
        ['expiry_filter' => 'all'],
        false
    );

    expect($allResults->pluck('id')->toArray())
        ->toContain($expired->id)
        ->toContain($expiresSoon->id)
        ->toContain($notExpiring->id)
        ->toContain($noExpiry->id);

    // Test default behavior (no filter)
    $defaultResults = $this->service->getFilteredPasswords(
        $this->user,
        [],
        false
    );

    expect($defaultResults->pluck('id')->toArray())
        ->toContain($expired->id)
        ->toContain($expiresSoon->id)
        ->toContain($notExpiring->id)
        ->toContain($noExpiry->id);
});

test('password query service handles expiry filters with other filters', function () {
    $expired = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(5),
        'name' => 'Expired Test Password',
        'type' => 'normal',
    ]);

    $expiresSoon = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(10),
        'name' => 'Expiring Soon Test Password',
        'type' => 'ssh',
    ]);

    // Test combining expiry filter with type filter
    $results = $this->service->getFilteredPasswords(
        $this->user,
        [
            'expiry_filter' => 'expired',
            'type' => 'normal',
        ],
        false
    );

    expect($results->pluck('id')->toArray())
        ->toContain($expired->id)
        ->not->toContain($expiresSoon->id);

    // Test combining expiry filter with search
    $searchResults = $this->service->getFilteredPasswords(
        $this->user,
        [
            'expiry_filter' => 'expires_soon',
            'search' => 'Expiring Soon',
        ],
        false
    );

    expect($searchResults->pluck('id')->toArray())
        ->not->toContain($expired->id)
        ->toContain($expiresSoon->id);
});

test('password query service get filter array includes expiry filters', function () {
    $request = new class {
        public $expiry_filter = 'expired';
        public $type = 'normal';
        public $search = 'test';
        public $sort = 'name';
        public $direction = 'asc';
        public $folder_id = 'all';
    };

    $filters = $this->service->getFilterArray($request);

    expect($filters)->toHaveKey('expiry_filter')
        ->and($filters['expiry_filter'])->toBe('expired');
});
