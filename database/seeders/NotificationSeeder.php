<?php

namespace Database\Seeders;

use App\Models\Password;
use App\Models\User;
use App\Notifications\PasswordExpired;
use App\Notifications\PasswordExpiringSoon;
use App\Notifications\WelcomeNotification;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $user = User::find(1);

        if (!$user) {
            $this->command->error('User with ID 1 not found. Please ensure user exists before seeding notifications.');
            return;
        }

        // Send welcome notification
        $user->notify(new WelcomeNotification());
        $this->command->info('✅ Created welcome notification for user 1');

        // Get expired passwords and send notifications
        $expiredPasswords = Password::where('user_id', $user->id)
            ->whereExpired()
            ->get();

        foreach ($expiredPasswords as $password) {
            $user->notify(new PasswordExpired($password));
        }

        if ($expiredPasswords->count() > 0) {
            $this->command->info("✅ Created {$expiredPasswords->count()} expired password notifications");
        }

        // Get expiring soon passwords and send notifications
        $expiringSoonPasswords = Password::where('user_id', $user->id)
            ->expiresSoon()
            ->get();

        foreach ($expiringSoonPasswords as $password) {
            $user->notify(new PasswordExpiringSoon($password));
        }

        if ($expiringSoonPasswords->count() > 0) {
            $this->command->info("✅ Created {$expiringSoonPasswords->count()} expiring soon password notifications");
        }

        // Mark some notifications as read to show variety
        $notifications = $user->notifications()->take(2)->get();
        foreach ($notifications as $notification) {
            $notification->markAsRead();
        }

        if ($notifications->count() > 0) {
            $this->command->info("✅ Marked {$notifications->count()} notifications as read");
        }

        $totalNotifications = $user->notifications()->count();
        $unreadCount = $user->unreadNotifications()->count();

        $this->command->info("📊 Total notifications: {$totalNotifications} ({$unreadCount} unread)");
    }
}
