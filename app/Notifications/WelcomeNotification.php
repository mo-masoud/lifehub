<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome to LifeHub!',
            'message' => 'Welcome to LifeHub! Your secure password manager is ready to help you organize and protect your digital life.',
            'icon_type' => 'welcome',
        ];
    }

    /**
     * Determine if the notification should be sent.
     */
    public function shouldSend(object $notifiable): bool
    {
        return true;
    }
}
