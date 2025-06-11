<?php

namespace Tests\Unit;

use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Tests\TestCase;

class WelcomeNotificationTest extends TestCase
{
    use RefreshDatabase;

    private WelcomeNotification $notification;

    protected function setUp(): void
    {
        parent::setUp();
        $this->notification = new WelcomeNotification();
    }

    public function test_it_has_correct_notification_type(): void
    {
        expect($this->notification)->toBeInstanceOf(WelcomeNotification::class);
    }

    public function test_it_delivers_via_database_channel(): void
    {
        $user = User::factory()->create();
        $channels = $this->notification->via($user);

        expect($channels)->toBe(['database']);
    }

    public function test_it_creates_correct_array_representation(): void
    {
        $user = User::factory()->create();
        $array = $this->notification->toArray($user);

        expect($array)->toHaveKeys(['title', 'message', 'icon_type'])
            ->and($array['title'])->toBe('Welcome to LifeHub!')
            ->and($array['message'])->toBe('Welcome to LifeHub! Your secure password manager is ready to help you organize and protect your digital life.')
            ->and($array['icon_type'])->toBe('welcome');
    }

    public function test_it_should_always_send(): void
    {
        $user = User::factory()->create();
        $shouldSend = $this->notification->shouldSend($user);

        expect($shouldSend)->toBeTrue();
    }

    public function test_it_works_with_anonymous_notifiable(): void
    {
        $notifiable = new AnonymousNotifiable();
        $channels = $this->notification->via($notifiable);

        expect($channels)->toBe(['database']);
    }
}
