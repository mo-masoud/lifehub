<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Get latest notifications for a user
     */
    public function getLatestNotifications(User $user, int $limit = 5): Collection
    {
        return $user->notifications()
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($notification) {
                return $this->formatNotification($notification);
            });
    }

    /**
     * Get unread notifications count for a user
     */
    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead(User $user, string $notificationId): bool
    {
        $notification = $user->notifications()->where('id', $notificationId)->first();

        if (!$notification || $notification->read_at) {
            return false;
        }

        $notification->markAsRead();
        return true;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(User $user): int
    {
        $count = $user->unreadNotifications()->count();
        $user->unreadNotifications->markAsRead();
        return $count;
    }

    /**
     * Get paginated notifications for a user
     */
    public function getPaginatedNotifications(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $user->notifications()
            ->latest()
            ->paginate($perPage)
            ->through(function ($notification) {
                return $this->formatNotification($notification);
            });
    }

    /**
     * Format notification for API response
     */
    private function formatNotification($notification): array
    {
        $data = $notification->data;

        // For password expiration notifications, include the full password object
        $passwordData = null;
        if (in_array($notification->type, [
            'password-expired',
            'password-expiring-soon',
        ]) && isset($data['password_id'])) {
            $password = \App\Models\Password::find($data['password_id']);
            if ($password) {
                $passwordData = $password->load('folder')->toArray();
            }
        }

        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $data['title'] ?? 'Notification',
            'message' => $data['message'] ?? '',
            'icon_type' => $data['icon_type'] ?? 'default',
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
            'password' => $passwordData, // Include full password object for expiration notifications
        ];
    }
}
