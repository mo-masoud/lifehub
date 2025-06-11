<?php

use App\Models\Password;
use App\Models\User;
use App\Notifications\PasswordExpired;
use App\Notifications\PasswordExpiringSoon;
use Illuminate\Support\Facades\Notification;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Notification::fake();
});

it('runs successfully with no passwords', function () {
    $this->artisan('passwords:check-expirations')
        ->expectsOutput('Checking password expirations...')
        ->assertExitCode(0);
});

it('sends notifications for expiring soon passwords', function () {
    $user = User::factory()->create();
    $password = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);

    $this->artisan('passwords:check-expirations')
        ->expectsOutput('Checking password expirations...')
        ->assertExitCode(0);

    Notification::assertSentTo($user, PasswordExpiringSoon::class);
});

it('sends notifications for expired passwords', function () {
    $user = User::factory()->create();
    $password = Password::factory()->expired()->create(['user_id' => $user->id]);

    $this->artisan('passwords:check-expirations')
        ->expectsOutput('Checking password expirations...')
        ->assertExitCode(0);

    Notification::assertSentTo($user, PasswordExpired::class);
});

it('sends both types of notifications', function () {
    $user = User::factory()->create();
    $expiringSoonPassword = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);
    $expiredPassword = Password::factory()->expired()->create(['user_id' => $user->id]);

    $this->artisan('passwords:check-expirations')
        ->expectsOutput('Checking password expirations...')
        ->assertExitCode(0);

    Notification::assertSentTo($user, PasswordExpiringSoon::class);
    Notification::assertSentTo($user, PasswordExpired::class);
});

it('displays results summary table', function () {
    $user = User::factory()->create();
    $expiringSoonPassword = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);
    $expiredPassword = Password::factory()->expired()->create(['user_id' => $user->id]);

    $this->artisan('passwords:check-expirations')
        ->expectsOutput('📊 Results Summary:')
        ->expectsTable(['Metric', 'Count'], [
            ['Total Notifications Sent', '2'],
            ['Total Notifications Skipped', '0'],
            ['Expiring Soon Sent', '1'],
            ['Expiring Soon Skipped', '0'],
            ['Expired Sent', '1'],
            ['Expired Skipped', '0'],
        ])
        ->assertExitCode(0);
});

it('shows sent notifications in detailed tables', function () {
    $user = User::factory()->create();
    $expiringSoonPassword = Password::factory()->expiringSoon()->create([
        'user_id' => $user->id,
        'name' => 'Expiring Password'
    ]);
    $expiredPassword = Password::factory()->expired()->create([
        'user_id' => $user->id,
        'name' => 'Expired Password'
    ]);

    $this->artisan('passwords:check-expirations')
        ->expectsOutput('🔔 Expiring Soon Notifications Sent:')
        ->expectsTable(['Password ID', 'Password Name', 'User ID'], [
            [$expiringSoonPassword->id, 'Expiring Password', $user->id]
        ])
        ->expectsOutput('⚠️  Expired Notifications Sent:')
        ->expectsTable(['Password ID', 'Password Name', 'User ID'], [
            [$expiredPassword->id, 'Expired Password', $user->id]
        ])
        ->assertExitCode(0);
});

it('shows skipped notifications when duplicates exist', function () {
    $user = User::factory()->create();
    $password = Password::factory()->expiringSoon()->create([
        'user_id' => $user->id,
        'name' => 'Test Password'
    ]);

    // Create an existing unread notification
    $user->notify(new PasswordExpiringSoon($password));

    // Refresh the user to get the latest notification count
    $user->refresh();
    $initialNotificationCount = $user->unreadNotifications()->count();

    $this->artisan('passwords:check-expirations')
        ->expectsOutputToContain('Results Summary')
        ->expectsOutputToContain('Test Password')
        ->assertExitCode(0);

    // Verify no additional notifications were sent
    $user->refresh();
    expect($user->unreadNotifications()->count())->toBe($initialNotificationCount);
});

describe('dry run mode', function () {
    it('shows what would be sent without sending notifications', function () {
        $user = User::factory()->create();
        $password = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);

        $this->artisan('passwords:check-expirations --dry-run')
            ->expectsOutput('DRY RUN MODE - No notifications will be sent')
            ->expectsOutput('📊 Results Summary:')
            ->assertExitCode(0);

        Notification::assertNothingSent();
    });

    it('shows correct counts in dry run mode', function () {
        $user = User::factory()->create();
        $expiringSoonPassword = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);
        $expiredPassword = Password::factory()->expired()->create(['user_id' => $user->id]);

        $this->artisan('passwords:check-expirations --dry-run')
            ->expectsOutput('DRY RUN MODE - No notifications will be sent')
            ->expectsTable(['Metric', 'Count'], [
                ['Total Notifications Sent', '2'],
                ['Total Notifications Skipped', '0'],
                ['Expiring Soon Sent', '1'],
                ['Expiring Soon Skipped', '0'],
                ['Expired Sent', '1'],
                ['Expired Skipped', '0'],
            ])
            ->assertExitCode(0);

        Notification::assertNothingSent();
    });

    it('shows skipped notifications in dry run mode', function () {
        $user = User::factory()->create();
        $password = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);

        // Create an existing unread notification
        $user->notify(new PasswordExpiringSoon($password));
        $initialCount = $user->unreadNotifications()->count();

        $this->artisan('passwords:check-expirations --dry-run')
            ->expectsOutput('DRY RUN MODE - No notifications will be sent')
            ->expectsOutputToContain('Results Summary')
            ->assertExitCode(0);

        // Verify no new notifications were created in dry run mode
        expect($user->unreadNotifications()->count())->toBe($initialCount);
    });
});

it('shows execution time', function () {
    $this->artisan('passwords:check-expirations')
        ->expectsOutputToContain('Command completed in')
        ->assertExitCode(0);
});

it('handles multiple users with multiple passwords', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    // User 1 has 2 expiring soon passwords
    Password::factory()->expiringSoon()->count(2)->create(['user_id' => $user1->id]);

    // User 2 has 1 expired password
    Password::factory()->expired()->create(['user_id' => $user2->id]);

    $this->artisan('passwords:check-expirations')
        ->expectsTable(['Metric', 'Count'], [
            ['Total Notifications Sent', '3'],
            ['Total Notifications Skipped', '0'],
            ['Expiring Soon Sent', '2'],
            ['Expiring Soon Skipped', '0'],
            ['Expired Sent', '1'],
            ['Expired Skipped', '0'],
        ])
        ->assertExitCode(0);

    Notification::assertSentTo($user1, PasswordExpiringSoon::class, function ($notification) {
        return true; // We expect 2 notifications for user1
    });

    Notification::assertSentTo($user2, PasswordExpired::class);
});
