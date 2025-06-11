<?php

namespace App\Console\Commands;

use App\Services\PasswordNotificationService;
use Illuminate\Console\Command;

class CheckPasswordExpirations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'passwords:check-expirations {--dry-run : Display what would be sent without actually sending notifications}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for passwords that are expiring soon or expired and send notifications';

    /**
     * Execute the console command.
     */
    public function handle(PasswordNotificationService $notificationService): int
    {
        $this->info('Checking password expirations...');

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - No notifications will be sent');
        }

        $startTime = now();

        if ($this->option('dry-run')) {
            $results = $this->performDryRun($notificationService);
        } else {
            $results = $notificationService->sendAllPasswordNotifications();
        }

        $this->displayResults($results);

        $executionTime = $startTime->diffInSeconds(now());
        $this->info("Command completed in {$executionTime} seconds");

        return self::SUCCESS;
    }

    /**
     * Perform a dry run to show what notifications would be sent.
     */
    protected function performDryRun(PasswordNotificationService $notificationService): array
    {
        // For dry run, we'll check what would be sent without actually sending
        $expiringSoonResults = $this->getDryRunResults($notificationService, 'expiring-soon');
        $expiredResults = $this->getDryRunResults($notificationService, 'expired');

        return [
            'expiring_soon' => $expiringSoonResults,
            'expired' => $expiredResults,
            'summary' => [
                'total_sent' => count($expiringSoonResults['sent']) + count($expiredResults['sent']),
                'total_skipped' => count($expiringSoonResults['skipped']) + count($expiredResults['skipped']),
            ]
        ];
    }

    /**
     * Get dry run results for a specific notification type.
     */
    protected function getDryRunResults(PasswordNotificationService $notificationService, string $type): array
    {
        // Use reflection to access the protected methods for dry run
        $reflection = new \ReflectionClass($notificationService);
        $shouldSendMethod = $reflection->getMethod('shouldSendNotification');
        $shouldSendMethod->setAccessible(true);

        $sent = [];
        $skipped = [];

        if ($type === 'expiring-soon') {
            $passwords = \App\Models\Password::expiresSoon()->with('user')->get();
            $notificationType = 'password-expiring-soon';
        } else {
            $passwords = \App\Models\Password::whereExpired()->with('user')->get();
            $notificationType = 'password-expired';
        }

        foreach ($passwords as $password) {
            if ($shouldSendMethod->invoke($notificationService, $password->user, $password, $notificationType)) {
                $sent[] = [
                    'password_id' => $password->id,
                    'password_name' => $password->name,
                    'user_id' => $password->user_id,
                    'type' => $type
                ];
            } else {
                $skipped[] = [
                    'password_id' => $password->id,
                    'password_name' => $password->name,
                    'user_id' => $password->user_id,
                    'type' => $type,
                    'reason' => 'Recent or unread notification exists'
                ];
            }
        }

        return ['sent' => $sent, 'skipped' => $skipped];
    }

    /**
     * Display the results in a formatted table.
     */
    protected function displayResults(array $results): void
    {
        $this->newLine();
        $this->info('📊 Results Summary:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Notifications Sent', $results['summary']['total_sent']],
                ['Total Notifications Skipped', $results['summary']['total_skipped']],
                ['Expiring Soon Sent', count($results['expiring_soon']['sent'])],
                ['Expiring Soon Skipped', count($results['expiring_soon']['skipped'])],
                ['Expired Sent', count($results['expired']['sent'])],
                ['Expired Skipped', count($results['expired']['skipped'])],
            ]
        );

        if (!empty($results['expiring_soon']['sent'])) {
            $this->newLine();
            $this->info('🔔 Expiring Soon Notifications Sent:');
            $this->table(
                ['Password ID', 'Password Name', 'User ID'],
                array_map(fn($item) => [$item['password_id'], $item['password_name'], $item['user_id']], $results['expiring_soon']['sent'])
            );
        }

        if (!empty($results['expired']['sent'])) {
            $this->newLine();
            $this->info('⚠️  Expired Notifications Sent:');
            $this->table(
                ['Password ID', 'Password Name', 'User ID'],
                array_map(fn($item) => [$item['password_id'], $item['password_name'], $item['user_id']], $results['expired']['sent'])
            );
        }

        if (!empty($results['expiring_soon']['skipped']) || !empty($results['expired']['skipped'])) {
            $this->newLine();
            $this->info('⏭️  Notifications Skipped (recent or unread exists):');
            $skipped = array_merge($results['expiring_soon']['skipped'], $results['expired']['skipped']);
            $this->table(
                ['Password ID', 'Password Name', 'User ID', 'Type', 'Reason'],
                array_map(fn($item) => [$item['password_id'], $item['password_name'], $item['user_id'], $item['type'], $item['reason']], $skipped)
            );
        }
    }
}
