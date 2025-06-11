<?php

namespace Tests\Unit;

use App\Models\Password;
use App\Models\User;
use App\Notifications\PasswordExpired;
use App\Notifications\PasswordExpiringSoon;
use App\Notifications\WelcomeNotification;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    private NotificationService $service;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NotificationService();
        $this->user = User::factory()->create();
    }

    public function test_getLatestNotifications_returns_formatted_notifications(): void
    {
        // Create notifications (latest first order)
        $password = Password::factory()->expired()->create(['user_id' => $this->user->id]);
        $this->user->notify(new PasswordExpired($password));
        $this->user->notify(new WelcomeNotification());

        $notifications = $this->service->getLatestNotifications($this->user, 5);

        expect($notifications)->toHaveCount(2)
            ->and($notifications->first())->toHaveKeys(['id', 'type', 'title', 'message', 'icon_type', 'read_at', 'created_at', 'password']);
    }

    public function test_getLatestNotifications_respects_limit(): void
    {
        // Create 3 notifications
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());

        $notifications = $this->service->getLatestNotifications($this->user, 2);

        expect($notifications)->toHaveCount(2);
    }

    public function test_getLatestNotifications_includes_password_data_for_expiration_notifications(): void
    {
        $password = Password::factory()->expired()->create(['user_id' => $this->user->id]);
        $this->user->notify(new PasswordExpired($password));

        $notifications = $this->service->getLatestNotifications($this->user, 5);

        expect($notifications->first()['password'])->not->toBeNull()
            ->and($notifications->first()['password']['id'])->toBe($password->id)
            ->and($notifications->first()['password']['name'])->toBe($password->name);
    }

    public function test_getLatestNotifications_excludes_password_data_for_other_notifications(): void
    {
        $this->user->notify(new WelcomeNotification());

        $notifications = $this->service->getLatestNotifications($this->user, 5);

        expect($notifications->first()['password'])->toBeNull();
    }

    public function test_getUnreadCount_returns_correct_count(): void
    {
        // Create notifications and mark some as read
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());

        // Mark one as read
        $this->user->notifications()->first()->markAsRead();

        $count = $this->service->getUnreadCount($this->user);

        expect($count)->toBe(2);
    }

    public function test_getUnreadCount_returns_zero_when_no_notifications(): void
    {
        $count = $this->service->getUnreadCount($this->user);

        expect($count)->toBe(0);
    }

    public function test_markAsRead_marks_notification_as_read(): void
    {
        $this->user->notify(new WelcomeNotification());
        $notification = $this->user->notifications()->first();

        $result = $this->service->markAsRead($this->user, $notification->id);

        expect($result)->toBeTrue()
            ->and($notification->fresh()->read_at)->not->toBeNull();
    }

    public function test_markAsRead_returns_false_for_non_existent_notification(): void
    {
        $result = $this->service->markAsRead($this->user, 'non-existent-id');

        expect($result)->toBeFalse();
    }

    public function test_markAsRead_returns_false_for_already_read_notification(): void
    {
        $this->user->notify(new WelcomeNotification());
        $notification = $this->user->notifications()->first();
        $notification->markAsRead();

        $result = $this->service->markAsRead($this->user, $notification->id);

        expect($result)->toBeFalse();
    }

    public function test_markAllAsRead_marks_all_unread_notifications(): void
    {
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());

        $count = $this->service->markAllAsRead($this->user);

        expect($count)->toBe(3)
            ->and($this->user->unreadNotifications()->count())->toBe(0);
    }

    public function test_markAllAsRead_returns_zero_when_no_unread_notifications(): void
    {
        $this->user->notify(new WelcomeNotification());
        $this->user->notifications()->first()->markAsRead();

        $count = $this->service->markAllAsRead($this->user);

        expect($count)->toBe(0);
    }

    public function test_getPaginatedNotifications_returns_paginated_results(): void
    {
        // Create 10 notifications
        for ($i = 0; $i < 10; $i++) {
            $this->user->notify(new WelcomeNotification());
        }

        $paginated = $this->service->getPaginatedNotifications($this->user, 5);

        expect($paginated->total())->toBe(10)
            ->and($paginated->perPage())->toBe(5)
            ->and($paginated->items())->toHaveCount(5);
    }

    public function test_getPaginatedNotifications_formats_notifications_correctly(): void
    {
        $this->user->notify(new WelcomeNotification());

        $paginated = $this->service->getPaginatedNotifications($this->user, 5);

        expect($paginated->items()[0])->toHaveKeys(['id', 'type', 'title', 'message', 'icon_type', 'read_at', 'created_at']);
    }

    public function test_formatNotification_handles_missing_password_gracefully(): void
    {
        // Create a password notification, then delete the password
        $password = Password::factory()->expired()->create(['user_id' => $this->user->id]);
        $this->user->notify(new PasswordExpired($password));
        $password->delete();

        $notifications = $this->service->getLatestNotifications($this->user, 5);

        expect($notifications->first()['password'])->toBeNull();
    }

    public function test_only_returns_user_owned_notifications(): void
    {
        $otherUser = User::factory()->create();

        // Create notifications for both users
        $this->user->notify(new WelcomeNotification());
        $otherUser->notify(new WelcomeNotification());

        $notifications = $this->service->getLatestNotifications($this->user, 10);

        expect($notifications)->toHaveCount(1);
    }
}
