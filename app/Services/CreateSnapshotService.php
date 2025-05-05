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
        $user->load('initialSavings', 'transactions');

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
                $type = $balance['type'];
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
        $data = $response->json();

        return isset($data['rates']['EGP']) ? (float) $data['rates']['EGP'] : 50.0;
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
        $final = [];

        // Step 1: Initial savings
        foreach ($user->initialSavings as $saving) {
            $key = $saving->type->value . '-' . $saving->storage_location_id;
            $final[$key] = [
                'type' => $saving->type->value,
                'storage_location_id' => $saving->storage_location_id,
                'amount' => $saving->amount,
            ];
        }

        // Step 2: Transactions
        foreach ($user->transactions as $tx) {
            if ($tx->direction === 'in') {
                $key = $tx->type . '-' . $tx->storage_location_id;
                if (!isset($final[$key])) {
                    $final[$key] = [
                        'type' => $tx->type,
                        'storage_location_id' => $tx->storage_location_id,
                        'amount' => 0,
                    ];
                }
                $final[$key]['amount'] += $tx->amount;
            } elseif ($tx->direction === 'out') {
                $key = $tx->type . '-' . $tx->storage_location_id;
                if (!isset($final[$key])) {
                    $final[$key] = [
                        'type' => $tx->type,
                        'storage_location_id' => $tx->storage_location_id,
                        'amount' => 0,
                    ];
                }
                $final[$key]['amount'] -= $tx->amount;
            } elseif ($tx->direction === 'transfer') {
                $fromKey = $tx->from_type . '-' . $tx->storage_location_id;
                if (!isset($final[$fromKey])) {
                    $final[$fromKey] = [
                        'type' => $tx->from_type,
                        'storage_location_id' => $tx->storage_location_id,
                        'amount' => 0,
                    ];
                }
                $final[$fromKey]['amount'] -= $tx->from_amount;

                $toKey = $tx->type . '-' . $tx->storage_location_id;
                if (!isset($final[$toKey])) {
                    $final[$toKey] = [
                        'type' => $tx->type,
                        'storage_location_id' => $tx->storage_location_id,
                        'amount' => 0,
                    ];
                }
                $final[$toKey]['amount'] += $tx->amount;
            }
        }

        // Remove zero balances
        return array_values(array_filter($final, fn ($item) => $item['amount'] != 0));
    }
}

