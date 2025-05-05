<?php

namespace App\Services;

use App\Models\Snapshot;
use App\Models\SnapshotItem;
use App\Models\User;
use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Throwable;

class CreateSnapshotService
{
    /**
     * @throws Throwable
     */
    public function handle(User $user): Snapshot
    {
        return DB::transaction(function () use ($user) {
            // Step 1: Get current rates
            $usdRate = $this->getUsdRate();
            $gold24 = $this->getGoldPrice(24);
            $gold21 = $this->getGoldPrice(21);

            // Step 2: Create the snapshot
            $snapshot = Snapshot::create([
                'user_id' => $user->id,
                'usd_rate' => $usdRate,
                'gold24_price' => $gold24,
                'gold21_price' => $gold21,
            ]);

            // Step 3: Build full balance snapshot
            $balances = $this->calculateUserBalance($user);

            foreach ($balances as $balance) {
                $type = $balance['type']->name;
                $rate = match ($type) {
                    'USD' => $usdRate,
                    'GOLD24' => $gold24,
                    'GOLD21' => $gold21,
                    'EGP' => 1.00,
                    default => throw new Exception("Unknown type: " . $type),
                };

                SnapshotItem::create([
                    'snapshot_id' => $snapshot->id,
                    'type' => $type,
                    'storage_location_id' => $balance['storage_location_id'],
                    'amount' => $balance['amount'],
                    'rate' => $rate,
                ]);
            }

            return $snapshot;
        });
    }

    /**
     * @throws ConnectionException
     */
    protected function getUsdRate(): float
    {
        $response = Http::get('https://api.exchangerate-api.com/v4/latest/USD');
        return $response->json()['rates']['EGP'] ?? 50;
    }

    /**
     * @throws Exception
     */
    protected function getGoldPrice(int $karat): float
    {
        return match ($karat) {
            24 => 4000.00,
            21 => 3700.00,
            default => throw new Exception("Unsupported karat"),
        };
    }

    protected function calculateUserBalance(User $user): array
    {
        return $user->initialSavings()
            ->selectRaw('type, storage_location_id, SUM(amount) as amount')
            ->groupBy('type', 'storage_location_id')
            ->get()
            ->map(fn ($item) => [
                'type' => $item->type,
                'storage_location_id' => $item->storage_location_id,
                'amount' => $item->amount,
            ])
            ->toArray();
    }
}
