<?php

use App\Models\Password;
use App\Models\User;
use App\Services\PasswordQueryService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = new PasswordQueryService;
});

test('getRecentlyUsedPasswords returns only passwords with last_used_at', function () {
    $usedPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'last_used_at' => now()->subHour(),
    ]);

    $neverUsedPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'last_used_at' => null,
    ]);

    $results = $this->service->getRecentlyUsedPasswords($this->user, 5);

    expect($results->pluck('id')->toArray())
        ->toContain($usedPassword->id)
        ->not->toContain($neverUsedPassword->id);
});

test('getRecentlyUsedPasswords orders by last_used_at descending', function () {
    $olderPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'last_used_at' => now()->subDays(5),
    ]);

    $newerPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'last_used_at' => now()->subHour(),
    ]);

    $results = $this->service->getRecentlyUsedPasswords($this->user, 5);

    expect($results->first()->id)->toBe($newerPassword->id)
        ->and($results->last()->id)->toBe($olderPassword->id);
});

test('getRecentlyUsedPasswords respects limit parameter', function () {
    Password::factory()->count(7)->create([
        'user_id' => $this->user->id,
        'last_used_at' => now()->subMinutes(rand(1, 60)),
    ]);

    $results = $this->service->getRecentlyUsedPasswords($this->user, 3);

    expect($results)->toHaveCount(3);
});

test('getRecentlyUsedPasswords includes folder relationship', function () {
    $folder = \App\Models\Folder::factory()->create(['user_id' => $this->user->id]);

    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'folder_id' => $folder->id,
        'last_used_at' => now(),
    ]);

    $results = $this->service->getRecentlyUsedPasswords($this->user, 5);

    expect($results->first()->folder)->not->toBeNull()
        ->and($results->first()->folder->id)->toBe($folder->id);
});

test('getRecentlyExpiredPasswords returns only expired passwords', function () {
    $expiredPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(5),
    ]);

    $notExpiredPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(5),
    ]);

    $noExpiryPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => null,
    ]);

    $results = $this->service->getRecentlyExpiredPasswords($this->user, 5);

    expect($results->pluck('id')->toArray())
        ->toContain($expiredPassword->id)
        ->not->toContain($notExpiredPassword->id)
        ->not->toContain($noExpiryPassword->id);
});

test('getRecentlyExpiredPasswords excludes passwords expired more than 30 days ago', function () {
    $recentlyExpiredPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(10),
    ]);

    $oldExpiredPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(40),
    ]);

    $results = $this->service->getRecentlyExpiredPasswords($this->user, 5);

    expect($results->pluck('id')->toArray())
        ->toContain($recentlyExpiredPassword->id)
        ->not->toContain($oldExpiredPassword->id);
});

test('getRecentlyExpiredPasswords orders by expires_at descending', function () {
    $olderExpiredPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(20),
    ]);

    $newerExpiredPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(5),
    ]);

    $results = $this->service->getRecentlyExpiredPasswords($this->user, 5);

    expect($results->first()->id)->toBe($newerExpiredPassword->id)
        ->and($results->last()->id)->toBe($olderExpiredPassword->id);
});

test('getRecentlyExpiredPasswords respects limit parameter', function () {
    Password::factory()->count(7)->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(rand(1, 20)),
    ]);

    $results = $this->service->getRecentlyExpiredPasswords($this->user, 3);

    expect($results)->toHaveCount(3);
});

test('getRecentlyExpiredPasswords includes folder relationship', function () {
    $folder = \App\Models\Folder::factory()->create(['user_id' => $this->user->id]);

    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'folder_id' => $folder->id,
        'expires_at' => now()->subDays(5),
    ]);

    $results = $this->service->getRecentlyExpiredPasswords($this->user, 5);

    expect($results->first()->folder)->not->toBeNull()
        ->and($results->first()->folder->id)->toBe($folder->id);
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

    // Test default behavior
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
    $request = new class
    {
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
