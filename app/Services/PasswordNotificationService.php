<?php

namespace App\Services;

use App\Models\Password;
use App\Models\User;
use App\Notifications\PasswordExpired;
use App\Notifications\PasswordExpiringSoon;

class PasswordNotificationService
{
    /**
     * Send expiring soon notifications for passwords that are expiring within 15 days.
     */
    public function sendExpiringSoonNotifications(): array
    {
        $sent = [];
        $skipped = [];

        $expiringSoonPasswords = Password::expiresSoon()
            ->with('user')
            ->get();

        foreach ($expiringSoonPasswords as $password) {
            if ($this->shouldSendNotification($password->user, $password, 'password-expiring-soon')) {
                $password->user->notify(new PasswordExpiringSoon($password));
                $sent[] = [
                    'password_id' => $password->id,
                    'password_name' => $password->name,
                    'user_id' => $password->user_id,
                    'type' => 'expiring-soon'
                ];
            } else {
                $skipped[] = [
                    'password_id' => $password->id,
                    'password_name' => $password->name,
                    'user_id' => $password->user_id,
                    'type' => 'expiring-soon',
                    'reason' => 'Recent or unread notification exists'
                ];
            }
        }

        return ['sent' => $sent, 'skipped' => $skipped];
    }

    /**
     * Send expired notifications for passwords that have already expired.
     */
    public function sendExpiredNotifications(): array
    {
        $sent = [];
        $skipped = [];

        $expiredPasswords = Password::whereExpired()
            ->with('user')
            ->get();

        foreach ($expiredPasswords as $password) {
            if ($this->shouldSendNotification($password->user, $password, 'password-expired')) {
                $password->user->notify(new PasswordExpired($password));
                $sent[] = [
                    'password_id' => $password->id,
                    'password_name' => $password->name,
                    'user_id' => $password->user_id,
                    'type' => 'expired'
                ];
            } else {
                $skipped[] = [
                    'password_id' => $password->id,
                    'password_name' => $password->name,
                    'user_id' => $password->user_id,
                    'type' => 'expired',
                    'reason' => 'Recent or unread notification exists'
                ];
            }
        }

        return ['sent' => $sent, 'skipped' => $skipped];
    }

    /**
     * Check if a notification should be sent for a specific password and type.
     *
     * Prevents duplicates by checking:
     * 1. No unread notification exists for the same password
     * 2. No notification of the same type was created within 10 days
     */
    protected function shouldSendNotification(User $user, Password $password, string $notificationType): bool
    {
        // Check for unread notifications for this password
        $hasUnreadNotification = $user->unreadNotifications()
            ->where('data->password_id', $password->id)
            ->exists();

        if ($hasUnreadNotification) {
            return false;
        }

        // Check for notifications of the same type within 10 days
        $hasRecentNotification = $user->notifications()
            ->where('type', $this->getNotificationClass($notificationType))
            ->where('data->password_id', $password->id)
            ->where('created_at', '>=', now()->subDays(10))
            ->exists();

        return !$hasRecentNotification;
    }

    /**
     * Get the full notification class name for a given type.
     */
    protected function getNotificationClass(string $type): string
    {
        return match ($type) {
            'password-expiring-soon' => PasswordExpiringSoon::class,
            'password-expired' => PasswordExpired::class,
            default => throw new \InvalidArgumentException("Unknown notification type: {$type}")
        };
    }

    /**
     * Send both expiring soon and expired notifications.
     */
    public function sendAllPasswordNotifications(): array
    {
        $expiringSoonResults = $this->sendExpiringSoonNotifications();
        $expiredResults = $this->sendExpiredNotifications();

        return [
            'expiring_soon' => $expiringSoonResults,
            'expired' => $expiredResults,
            'summary' => [
                'total_sent' => count($expiringSoonResults['sent']) + count($expiredResults['sent']),
                'total_skipped' => count($expiringSoonResults['skipped']) + count($expiredResults['skipped']),
            ]
        ];
    }
}
