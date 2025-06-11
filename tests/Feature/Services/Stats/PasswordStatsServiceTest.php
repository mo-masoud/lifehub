<?php

use App\Enums\PasswordTypes;
use App\Models\Password;
use App\Models\User;
use App\Services\Stats\PasswordStatsService;

beforeEach(function () {
    $this->passwordStatsService = app(PasswordStatsService::class);
    $this->user = User::factory()->create();
});

test('get type distribution returns correct counts', function () {
    // Create test passwords
    Password::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'type' => PasswordTypes::Normal,
    ]);

    Password::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'type' => PasswordTypes::SSH,
    ]);

    // Create passwords for another user (should not be included)
    $otherUser = User::factory()->create();
    Password::factory()->create([
        'user_id' => $otherUser->id,
        'type' => PasswordTypes::Normal,
    ]);

    $distribution = $this->passwordStatsService->getTypeDistribution($this->user);

    expect($distribution['normal'])->toBe(3);
    expect($distribution['ssh'])->toBe(2);
});

test('get type distribution handles empty results', function () {
    $distribution = $this->passwordStatsService->getTypeDistribution($this->user);

    expect($distribution['normal'])->toBe(0);
    expect($distribution['ssh'])->toBe(0);
});

test('get type distribution handles only one type', function () {
    Password::factory()->count(5)->create([
        'user_id' => $this->user->id,
        'type' => PasswordTypes::Normal,
    ]);

    $distribution = $this->passwordStatsService->getTypeDistribution($this->user);

    expect($distribution['normal'])->toBe(5);
    expect($distribution['ssh'])->toBe(0);
});

test('get top copied passwords returns correct data', function () {
    // Create passwords with different copy counts
    $password1 = Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Most Copied',
        'copied' => 10,
        'type' => PasswordTypes::Normal,
    ]);

    $password2 = Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Second Most',
        'copied' => 7,
        'type' => PasswordTypes::SSH,
    ]);

    $password3 = Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Third Most',
        'copied' => 5,
        'type' => PasswordTypes::Normal,
    ]);

    // Password with 0 copies (should not be included)
    Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Never Copied',
        'copied' => 0,
        'type' => PasswordTypes::Normal,
    ]);

    $topCopied = $this->passwordStatsService->getTopCopiedPasswords($this->user, 5);

    expect($topCopied)->toHaveCount(3);

    // Check order (most copied first)
    expect($topCopied[0]['name'])->toBe('Most Copied');
    expect($topCopied[0]['copied'])->toBe(10);
    expect($topCopied[0]['type'])->toBe('normal');

    expect($topCopied[1]['name'])->toBe('Second Most');
    expect($topCopied[1]['copied'])->toBe(7);
    expect($topCopied[1]['type'])->toBe('ssh');

    expect($topCopied[2]['name'])->toBe('Third Most');
    expect($topCopied[2]['copied'])->toBe(5);
    expect($topCopied[2]['type'])->toBe('normal');
});

test('get top copied passwords respects limit', function () {
    // Create 7 passwords with different copy counts
    for ($i = 1; $i <= 7; $i++) {
        Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => "Password {$i}",
            'copied' => $i,
            'type' => PasswordTypes::Normal,
        ]);
    }

    $topCopied = $this->passwordStatsService->getTopCopiedPasswords($this->user, 3);

    expect($topCopied)->toHaveCount(3);

    // Should get the top 3 (7, 6, 5)
    expect($topCopied[0]['copied'])->toBe(7);
    expect($topCopied[1]['copied'])->toBe(6);
    expect($topCopied[2]['copied'])->toBe(5);
});

test('get top copied passwords returns empty for no copied passwords', function () {
    Password::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'copied' => 0,
    ]);

    $topCopied = $this->passwordStatsService->getTopCopiedPasswords($this->user);

    expect($topCopied)->toHaveCount(0);
});

test('get top copied passwords excludes other users', function () {
    $otherUser = User::factory()->create();

    // Create password for current user
    Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'My Password',
        'copied' => 5,
    ]);

    // Create password for other user (should not be included)
    Password::factory()->create([
        'user_id' => $otherUser->id,
        'name' => 'Other Password',
        'copied' => 10,
    ]);

    $topCopied = $this->passwordStatsService->getTopCopiedPasswords($this->user);

    expect($topCopied)->toHaveCount(1);
    expect($topCopied[0]['name'])->toBe('My Password');
    expect($topCopied[0]['copied'])->toBe(5);
});

test('get security health overview categorizes correctly', function () {
    // Mock passwords with different strength scores
    $strongPassword = Password::factory()->withPlainPassword('VeryStr0ng!P@ssw0rd123')->create([
        'user_id' => $this->user->id,
    ]);

    $mediumPassword = Password::factory()->withPlainPassword('Medium123!')->create([
        'user_id' => $this->user->id,
    ]);

    $weakPassword = Password::factory()->withPlainPassword('weak')->create([
        'user_id' => $this->user->id,
    ]);

    $healthOverview = $this->passwordStatsService->getSecurityHealthOverview($this->user);

    // Note: The exact counts might vary based on the password strength calculator
    // This test verifies the structure and that passwords are being categorized
    expect($healthOverview)->toBeArray();
    expect($healthOverview)->toHaveKey('strong');
    expect($healthOverview)->toHaveKey('medium');
    expect($healthOverview)->toHaveKey('weak');

    $total = $healthOverview['strong'] + $healthOverview['medium'] + $healthOverview['weak'];
    expect($total)->toBe(3);
});

test('get security health overview handles empty passwords', function () {
    $healthOverview = $this->passwordStatsService->getSecurityHealthOverview($this->user);

    expect($healthOverview['strong'])->toBe(0);
    expect($healthOverview['medium'])->toBe(0);
    expect($healthOverview['weak'])->toBe(0);
});

test('get security health overview handles decryption errors', function () {
    // Create a password with corrupted encryption data
    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'password' => 'corrupted_encrypted_data',
        'encrypted_key' => 'invalid_key',
        'key_version' => 999,
    ]);

    $healthOverview = $this->passwordStatsService->getSecurityHealthOverview($this->user);

    // The total should include the password with corrupted data
    $total = $healthOverview['strong'] + $healthOverview['medium'] + $healthOverview['weak'];
    expect($total)->toBe(1);

    // Since we can't predict exactly which category it will fall into,
    // we just verify the password was counted somewhere
    expect($total)->toBeGreaterThanOrEqual(1);
});

test('get all stats returns complete data', function () {
    // Create some test data
    Password::factory()->create([
        'user_id' => $this->user->id,
        'type' => PasswordTypes::Normal,
        'copied' => 5,
    ]);

    Password::factory()->create([
        'user_id' => $this->user->id,
        'type' => PasswordTypes::SSH,
        'copied' => 3,
    ]);

    $allStats = $this->passwordStatsService->getAllStats($this->user);

    expect($allStats)->toBeArray();
    expect($allStats)->toHaveKey('type_distribution');
    expect($allStats)->toHaveKey('top_copied_passwords');
    expect($allStats)->toHaveKey('security_health');

    // Verify structure of type_distribution
    expect($allStats['type_distribution'])->toHaveKey('normal');
    expect($allStats['type_distribution'])->toHaveKey('ssh');

    // Verify top_copied_passwords is a collection
    expect($allStats['top_copied_passwords'])->toBeIterable();

    // Verify structure of security_health
    expect($allStats['security_health'])->toHaveKey('strong');
    expect($allStats['security_health'])->toHaveKey('medium');
    expect($allStats['security_health'])->toHaveKey('weak');
});
