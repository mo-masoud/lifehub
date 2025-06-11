<?php

namespace App\Notifications;

use App\Models\Password;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordExpired extends Notification
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
        return 'password-expired';
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
            'title' => 'Password Expired',
            'message' => 'The password for `' . $this->password->name . '` has expired. It expired ' . $this->password->expires_at->diffForHumans() . '. Please update it to maintain security.',
        ];
    }

    public function shouldSend(object $notifiable, string $channel): bool
    {
        return $this->password->expires_at && $this->password->is_expired;
    }
}
