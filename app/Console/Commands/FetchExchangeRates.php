<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\ExchangeRate;
use App\Services\ExchangeRateService;
use Illuminate\Console\Command;

class FetchExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exchange-rates:fetch {--user-id= : Fetch rates for specific user ID only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch exchange rates for users based on their frequency settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');

        if ($userId) {
            $users = User::where('id', $userId)->get();
            if ($users->isEmpty()) {
                $this->error("User with ID {$userId} not found.");
                return 1;
            }
        } else {
            $users = User::all();
        }

        $exchangeRateService = app(ExchangeRateService::class);
        $updated = 0;
        $skipped = 0;

        $this->info("Checking exchange rates for " . $users->count() . " user(s)...");

        foreach ($users as $user) {
            $this->line("Processing user: {$user->name} (ID: {$user->id})");

            // Get current rate for this user
            $currentRate = ExchangeRate::where('user_id', $user->id)
                ->where('currency_code', 'USD')
                ->where('is_active', true)
                ->first();

            // Check if rate needs updating
            if (!$currentRate || $currentRate->needsRefresh($user)) {
                try {
                    $newRate = $exchangeRateService->getUsdRate($user);
                    $this->info("  ✅ Updated USD rate: {$newRate} EGP");
                    $updated++;
                } catch (\Exception $e) {
                    $this->error("  ❌ Failed to update rate: " . $e->getMessage());
                }
            } else {
                $frequency = $user->getExchangeRateFrequency();
                $nextUpdate = $currentRate->fetched_at
                    ->addHours(config("exchange_rates.fetch_frequencies.{$frequency}.hours", 24));

                $this->line("  ⏭️  Rate is current (next update: {$nextUpdate->format('Y-m-d H:i:s')})");
                $skipped++;
            }
        }

        $this->info("\nSummary:");
        $this->info("- Updated: {$updated} users");
        $this->info("- Skipped: {$skipped} users");

        return 0;
    }
}
