<?php

use App\Models\Password;
use App\Models\User;
use App\Notifications\PasswordExpired;
use App\Notifications\PasswordExpiringSoon;
use App\Services\PasswordNotificationService;
use Tests\TestCase;

uses(TestCase::class);
uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->service = new PasswordNotificationService();
});

describe('sendExpiringSoonNotifications', function () {
    it('identifies passwords expiring soon', function () {
        $user = User::factory()->create();
        $password = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);

        $result = $this->service->sendExpiringSoonNotifications();

        expect($result['sent'])->toHaveCount(1)
            ->and($result['sent'][0]['password_id'])->toBe($password->id)
            ->and($result['sent'][0]['type'])->toBe('expiring-soon');
    });

    it('ignores passwords not expiring soon', function () {
        $user = User::factory()->create();
        Password::factory()->create([
            'user_id' => $user->id,
            'expires_at' => now()->addDays(30)
        ]);

        $result = $this->service->sendExpiringSoonNotifications();

        expect($result['sent'])->toHaveCount(0);
    });

    it('prevents duplicate notifications', function () {
        $user = User::factory()->create();
        $password = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);

        // Send first notification
        $firstResult = $this->service->sendExpiringSoonNotifications();
        expect($firstResult['sent'])->toHaveCount(1);

        // Try to send again - should be skipped due to unread notification
        $secondResult = $this->service->sendExpiringSoonNotifications();
        expect($secondResult['sent'])->toHaveCount(0)
            ->and($secondResult['skipped'])->toHaveCount(1);
    });
});

describe('sendExpiredNotifications', function () {
    it('identifies expired passwords', function () {
        $user = User::factory()->create();
        $password = Password::factory()->expired()->create(['user_id' => $user->id]);

        $result = $this->service->sendExpiredNotifications();

        expect($result['sent'])->toHaveCount(1)
            ->and($result['sent'][0]['password_id'])->toBe($password->id)
            ->and($result['sent'][0]['type'])->toBe('expired');
    });

    it('ignores non-expired passwords', function () {
        $user = User::factory()->create();
        Password::factory()->create([
            'user_id' => $user->id,
            'expires_at' => now()->addDays(30)
        ]);

        $result = $this->service->sendExpiredNotifications();

        expect($result['sent'])->toHaveCount(0);
    });

    it('prevents duplicate notifications', function () {
        $user = User::factory()->create();
        $password = Password::factory()->expired()->create(['user_id' => $user->id]);

        // Send first notification
        $firstResult = $this->service->sendExpiredNotifications();
        expect($firstResult['sent'])->toHaveCount(1);

        // Try to send again - should be skipped due to unread notification
        $secondResult = $this->service->sendExpiredNotifications();
        expect($secondResult['sent'])->toHaveCount(0)
            ->and($secondResult['skipped'])->toHaveCount(1);
    });
});

describe('sendAllPasswordNotifications', function () {
    it('sends both types of notifications', function () {
        $user = User::factory()->create();
        $expiringSoonPassword = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);
        $expiredPassword = Password::factory()->expired()->create(['user_id' => $user->id]);

        $result = $this->service->sendAllPasswordNotifications();

        expect($result['expiring_soon']['sent'])->toHaveCount(1)
            ->and($result['expired']['sent'])->toHaveCount(1)
            ->and($result['summary']['total_sent'])->toBe(2)
            ->and($result['summary']['total_skipped'])->toBe(0);
    });

    it('calculates correct summary statistics', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create passwords that will be sent
        Password::factory()->expiringSoon()->create(['user_id' => $user1->id]);
        Password::factory()->expired()->create(['user_id' => $user2->id]);

        // Create a password with existing notification (will be skipped)
        $passwordWithNotification = Password::factory()->expiringSoon()->create(['user_id' => $user1->id]);
        $user1->notify(new PasswordExpiringSoon($passwordWithNotification));

        $result = $this->service->sendAllPasswordNotifications();

        expect($result['summary']['total_sent'])->toBe(2)
            ->and($result['summary']['total_skipped'])->toBe(1);
    });
});

describe('cross-type duplicate prevention', function () {
    it('allows notifications for different passwords', function () {
        $user = User::factory()->create();
        $password1 = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);
        $password2 = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);

        // Send notification for first password
        $user->notify(new PasswordExpiringSoon($password1));

        $result = $this->service->sendExpiringSoonNotifications();

        // Should only send notification for second password, skip first
        expect($result['sent'])->toHaveCount(1)
            ->and($result['sent'][0]['password_id'])->toBe($password2->id)
            ->and($result['skipped'])->toHaveCount(1)
            ->and($result['skipped'][0]['password_id'])->toBe($password1->id);
    });
});

describe('10-day cooldown prevention', function () {
    it('allows sending after 10 day cooldown period', function () {
        $user = User::factory()->create();
        $password = Password::factory()->expiringSoon()->create(['user_id' => $user->id]);

        // Send notification and mark as read, then backdate it
        $user->notify(new PasswordExpiringSoon($password));
        $user->unreadNotifications()->update(['read_at' => now()]);
        \DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->update(['created_at' => now()->subDays(11)]);

        $result = $this->service->sendExpiringSoonNotifications();

        expect($result['sent'])->toHaveCount(1);
    });
});
