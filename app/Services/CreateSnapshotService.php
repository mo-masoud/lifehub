<?php

namespace App\Services;

use App\Models\Snapshot;
use App\Models\SnapshotItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Throwable;

class CreateSnapshotService
{
    /**
     * The user for whom the snapshot is being created.
     */
    protected User $user;

    /**
     * Handles the creation of a snapshot for the given user.
     *
     * @param User $user The user for whom the snapshot is being created.
     * @return Snapshot The created snapshot.
     * @throws Throwable If an error occurs during the snapshot creation process.
     */
    public function handle(User $user): Snapshot
    {
        $this->user = $user;
        $this->loadUserData();

        return DB::transaction(function () {
            $rates = $this->getRates();
            $snapshot = $this->createSnapshot($rates);
            $balances = $this->calculateUserBalance();
            $this->createSnapshotItems($snapshot, $balances, $rates);

            return $snapshot;
        });
    }

    /**
     * Loads the necessary relationships for the user.
     */
    protected function loadUserData(): void
    {
        $this->user->load('initialSavings', 'transactions', 'snapshots.items');
    }

    /**
     * Retrieves the current rates for USD and gold.
     *
     * @return array An associative array containing the rates for USD, gold24, and gold21.
     */
    protected function getRates(): array
    {
        return [
            'usd' => $this->user->getUsdRate(),
            'gold24' => $this->user->getGold24Rate(),
            'gold21' => $this->user->getGold21Rate(),
        ];
    }

    /**
     * Creates a snapshot for the user with the given rates.
     *
     * @param array $rates The rates to include in the snapshot.
     * @return Snapshot The created snapshot.
     */
    protected function createSnapshot(array $rates): Snapshot
    {
        return Snapshot::create([
            'user_id' => $this->user->id,
            'usd_rate' => $rates['usd'],
            'gold24_price' => $rates['gold24'],
            'gold21_price' => $rates['gold21'],
        ]);
    }

    /**
     * Creates snapshot items for the given snapshot and balances.
     *
     * @param Snapshot $snapshot The snapshot for which items are being created.
     * @param array $balances The balances to include in the snapshot items.
     * @param array $rates The rates to use for the snapshot items.
     */
    protected function createSnapshotItems(Snapshot $snapshot, array $balances, array $rates): void
    {
        foreach ($balances as $balance) {
            $rate = $rates[strtolower($balance['type'])] ?? 1.00;

            SnapshotItem::create([
                'snapshot_id' => $snapshot->id,
                'type' => $balance['type'],
                'storage_location_id' => $balance['storage_location_id'],
                'amount' => $balance['amount'],
                'rate' => $rate,
            ]);
        }
    }

    /**
     * Calculates the user's balances based on the last snapshot or initial savings and transactions.
     *
     * @return array An array of calculated balances.
     */
    protected function calculateUserBalance(): array
    {
        $final = [];
        $lastSnapshot = $this->user->snapshots->sortByDesc('created_at')->first();

        if ($lastSnapshot) {
            foreach ($lastSnapshot->items as $item) {
                $key = $item->type . '-' . $item->storage_location_id;
                $final[$key] = [
                    'type' => $item->type,
                    'storage_location_id' => $item->storage_location_id,
                    'amount' => $item->amount,
                ];
            }
        } else {
            foreach ($this->user->initialSavings as $saving) {
                $key = $saving->type->value . '-' . $saving->storage_location_id;
                $final[$key] = [
                    'type' => $saving->type->value,
                    'storage_location_id' => $saving->storage_location_id,
                    'amount' => $saving->amount,
                ];
            }
        }

        foreach ($this->user->transactions as $tx) {
            $this->applyTransactionToBalance($final, $tx);
        }

        return array_values(array_filter($final, fn($item) => $item['amount'] != 0));
    }

    /**
     * Applies a transaction to the user's balances.
     *
     * @param array &$final The array of balances to update.
     * @param mixed $tx The transaction to apply.
     */
    protected function applyTransactionToBalance(array &$final, $tx): void
    {
        if ($tx->direction === 'in') {
            $this->adjustBalance($final, $tx->type, $tx->storage_location_id, $tx->amount);
        } elseif ($tx->direction === 'out') {
            $this->adjustBalance($final, $tx->type, $tx->storage_location_id, -$tx->amount);
        } elseif ($tx->direction === 'transfer') {
            $this->adjustBalance($final, $tx->from_type, $tx->storage_location_id, -$tx->from_amount);
            $this->adjustBalance($final, $tx->type, $tx->storage_location_id, $tx->amount);
        }
    }

    /**
     * Adjusts a specific balance by the given amount.
     *
     * @param array &$final The array of balances to update.
     * @param string $type The type of the balance (e.g., USD, GOLD24).
     * @param int $storageLocationId The ID of the storage location.
     * @param float $amount The amount to adjust the balance by.
     */
    protected function adjustBalance(array &$final, string $type, int $storageLocationId, float $amount): void
    {
        $key = $type . '-' . $storageLocationId;
        if (!isset($final[$key])) {
            $final[$key] = [
                'type' => $type,
                'storage_location_id' => $storageLocationId,
                'amount' => 0,
            ];
        }
        $final[$key]['amount'] += $amount;
    }
}
