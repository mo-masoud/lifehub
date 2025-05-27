<?php

use App\Models\ExchangeRate;
use App\Models\User;
use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    // Create test users
    $this->user1 = User::factory()->create(['name' => 'User One']);
    $this->user2 = User::factory()->create(['name' => 'User Two']);
});

test('can fetch exchange rates for all users', function () {
    $this->artisan('exchange-rates:fetch')
        ->expectsOutput('Checking exchange rates for 2 user(s)...')
        ->expectsOutputToContain('Processing user: User One')
        ->expectsOutputToContain('Processing user: User Two')
        ->expectsOutputToContain('Summary:')
        ->assertExitCode(0);
});

test('can fetch exchange rates for specific user', function () {
    $this->artisan('exchange-rates:fetch', ['--user-id' => $this->user1->id])
        ->expectsOutput('Checking exchange rates for 1 user(s)...')
        ->expectsOutputToContain('Processing user: User One')
        ->doesntExpectOutputToContain('Processing user: User Two')
        ->assertExitCode(0);
});

test('fails with invalid user id', function () {
    $this->artisan('exchange-rates:fetch', ['--user-id' => 999])
        ->expectsOutput('User with ID 999 not found.')
        ->assertExitCode(1);
});

test('updates exchange rates for users without current rates', function () {
    // Mock HTTP response for exchange rate service
    Http::fake([
        '*' => Http::response(['rates' => ['EGP' => 50.0]], 200),
    ]);

    $this->artisan('exchange-rates:fetch', ['--user-id' => $this->user1->id])
        ->expectsOutputToContain('Updated USD rate: 50 EGP')
        ->expectsOutputToContain('Updated: 1 users')
        ->expectsOutputToContain('Skipped: 0 users')
        ->assertExitCode(0);

    // Verify exchange rate was created
    $rate = ExchangeRate::where('user_id', $this->user1->id)
        ->where('currency_code', 'USD')
        ->where('is_active', true)
        ->first();

    expect($rate)->not->toBeNull();
    expect((float) $rate->rate)->toBe(50.0);
});

test('skips users with current exchange rates', function () {
    // Create an existing current exchange rate
    ExchangeRate::factory()->create([
        'user_id' => $this->user1->id,
        'currency_code' => 'USD',
        'rate' => 48.5,
        'is_active' => true,
        'fetched_at' => now(),
    ]);

    $this->artisan('exchange-rates:fetch', ['--user-id' => $this->user1->id])
        ->expectsOutputToContain('Rate is current')
        ->expectsOutputToContain('Updated: 0 users')
        ->expectsOutputToContain('Skipped: 1 users')
        ->assertExitCode(0);
});

test('handles exchange rate service errors gracefully', function () {
    // Mock the exchange rate service to throw an exception
    $this->mock(ExchangeRateService::class, function ($mock) {
        $mock->shouldReceive('getUsdRate')
            ->andThrow(new \Exception('API service unavailable'));
    });

    $this->artisan('exchange-rates:fetch', ['--user-id' => $this->user1->id])
        ->expectsOutputToContain('Failed to update rate: API service unavailable')
        ->assertExitCode(0); // Command still succeeds even if individual rate updates fail
});

test('displays proper summary with mixed results', function () {
    // Create one user with current rate, leave one without
    ExchangeRate::factory()->create([
        'user_id' => $this->user1->id,
        'currency_code' => 'USD',
        'rate' => 48.5,
        'is_active' => true,
        'fetched_at' => now(),
    ]);

    // Mock HTTP response for the user without current rate
    Http::fake([
        '*' => Http::response(['rates' => ['EGP' => 50.0]], 200),
    ]);

    $this->artisan('exchange-rates:fetch')
        ->expectsOutputToContain('Updated: 1 users')
        ->expectsOutputToContain('Skipped: 1 users')
        ->assertExitCode(0);
});
