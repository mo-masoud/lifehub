<?php

namespace Tests\Feature\Controllers\API;

use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_index_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(401);
    }

    public function test_index_returns_latest_notifications(): void
    {
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'type',
                        'title',
                        'message',
                        'icon_type',
                        'read_at',
                        'created_at',
                        'password'
                    ]
                ]
            ])
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(2, 'data');
    }

    public function test_index_respects_limit_parameter(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->user->notify(new WelcomeNotification());
        }

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications?limit=3');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_index_only_returns_user_notifications(): void
    {
        $otherUser = User::factory()->create();

        $this->user->notify(new WelcomeNotification());
        $otherUser->notify(new WelcomeNotification());

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_unreadCount_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(401);
    }

    public function test_unreadCount_returns_correct_count(): void
    {
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());

        // Mark one as read
        $this->user->notifications()->first()->markAsRead();

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => ['count']
            ])
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.count', 1);
    }

    public function test_markAsRead_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/notifications/some-id/mark-read');

        $response->assertStatus(401);
    }

    public function test_markAsRead_marks_notification_as_read(): void
    {
        $this->user->notify(new WelcomeNotification());
        $notification = $this->user->notifications()->first();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/notifications/{$notification->id}/mark-read");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.message', 'Notification marked as read');

        expect($notification->fresh()->read_at)->not->toBeNull();
    }

    public function test_markAsRead_returns_404_for_non_existent_notification(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/notifications/non-existent-id/mark-read');

        $response->assertStatus(404)
            ->assertJsonPath('status', 'fail')
            ->assertJsonPath('data.message', 'Notification not found or already read');
    }

    public function test_markAsRead_returns_404_for_already_read_notification(): void
    {
        $this->user->notify(new WelcomeNotification());
        $notification = $this->user->notifications()->first();
        $notification->markAsRead();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/notifications/{$notification->id}/mark-read");

        $response->assertStatus(404)
            ->assertJsonPath('status', 'fail')
            ->assertJsonPath('data.message', 'Notification not found or already read');
    }

    public function test_markAsRead_prevents_marking_other_users_notifications(): void
    {
        $otherUser = User::factory()->create();
        $otherUser->notify(new WelcomeNotification());
        $notification = $otherUser->notifications()->first();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/notifications/{$notification->id}/mark-read");

        $response->assertStatus(404);
    }

    public function test_markAllAsRead_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/notifications/mark-all-read');

        $response->assertStatus(401);
    }

    public function test_markAllAsRead_marks_all_user_notifications(): void
    {
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());
        $this->user->notify(new WelcomeNotification());

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/notifications/mark-all-read');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.message', 'Marked 3 notifications as read');

        expect($this->user->unreadNotifications()->count())->toBe(0);
    }

    public function test_markAllAsRead_returns_zero_when_no_unread_notifications(): void
    {
        $this->user->notify(new WelcomeNotification());
        $this->user->notifications()->first()->markAsRead();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/notifications/mark-all-read');

        $response->assertStatus(200)
            ->assertJsonPath('data.message', 'Marked 0 notifications as read');
    }

    public function test_paginated_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/notifications/paginated');

        $response->assertStatus(401);
    }

    public function test_paginated_returns_paginated_notifications(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->user->notify(new WelcomeNotification());
        }

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications/paginated?per_page=5');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'type',
                            'title',
                            'message',
                            'icon_type',
                            'read_at',
                            'created_at',
                            'password'
                        ]
                    ],
                    'total',
                    'per_page',
                    'current_page'
                ]
            ])
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total', 10)
            ->assertJsonPath('data.per_page', 5)
            ->assertJsonCount(5, 'data.data');
    }

    public function test_paginated_uses_default_per_page(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $this->user->notify(new WelcomeNotification());
        }

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications/paginated');

        $response->assertStatus(200)
            ->assertJsonPath('data.per_page', 15);
    }

    public function test_paginated_only_returns_user_notifications(): void
    {
        $otherUser = User::factory()->create();

        $this->user->notify(new WelcomeNotification());
        $otherUser->notify(new WelcomeNotification());

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications/paginated');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 1);
    }

    public function test_api_returns_consistent_json_structure(): void
    {
        $this->user->notify(new WelcomeNotification());

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications');

        $notification = $response->json('data.0');

        expect($notification)->toHaveKeys([
            'id',
            'type',
            'title',
            'message',
            'icon_type',
            'read_at',
            'created_at',
            'password'
        ])
            ->and($notification['title'])->toBe('Welcome to LifeHub!')
            ->and($notification['icon_type'])->toBe('welcome')
            ->and($notification['password'])->toBeNull();
    }
}
