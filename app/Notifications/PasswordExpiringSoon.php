<?php

namespace App\Notifications;

use App\Models\Password;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordExpiringSoon extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(protected Password $password)
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
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'password-expiring-soon';
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'password_id' => $this->password->id,
            'title' => 'Password Expiring Soon',
            'message' => 'The password for `' . $this->password->name . '` is expiring soon. It will expire in ' . $this->password->expires_at->diffForHumans() . '.',
            'icon_type' => 'password_expiring',
        ];
    }

    public function shouldSend(object $notifiable, string $channel): bool
    {
        return $this->password->expires_at && $this->password->is_expired_soon;
    }
}
