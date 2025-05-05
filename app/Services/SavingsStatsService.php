<?php

namespace App\Services;

use App\Enums\SavingType;
use App\Enums\TransactionDirection;
use App\Models\Snapshot;
use App\Models\Transaction;
use App\Models\User;

class SavingsStatsService
{
    public function getStats($user): array
    {
        $snapshots = Snapshot::with('items.storageLocation')->where('user_id', $user->id)->orderByDesc('created_at')->take(2)->get();

        $latest = $snapshots->first();
        $previous = $snapshots->count() > 1 ? $snapshots->get(1) : null;

        $totalEgp = $latest?->total_egp ?? 0;
        $totalUsd = $latest?->total_usd ?? 0;

        $changePercent = null;
        if ($previous && $previous->total_egp > 0) {
            $diff = $totalEgp - $previous->total_egp;
            $changePercent = round(($diff / $previous->total_egp) * 100, 2);
        }

        $byLocation = [];
        if ($latest) {
            foreach ($latest->items as $item) {
                $value = $item->amount * $item->rate;
                $location = $item->storageLocation->name;
                $byLocation[$location] = ($byLocation[$location] ?? 0) + $value;
            }
        }

        $transfersThisMonth = Transaction::where('user_id', $user->id)
            ->where('direction', 'transfer')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        return [
            'current_month' => now()->format('M Y'),
            'total_egp' => $totalEgp,
            'total_usd' => $totalUsd,
            'change_percent' => $changePercent,
            'snapshot_count' => $snapshots->count(),
            'latest_snapshot_date' => $latest?->created_at->format('d M Y'),
            'by_location' => $byLocation,
            'monthly_transfers' => $transfersThisMonth,
            'top_transactions' => $this->getTopTransactionsForMonth($user),
        ];
    }

    public function getTopTransactionsForMonth(User $user): array
    {
        $result = [];

        foreach (TransactionDirection::values() as $dir) {
            $result[$dir] = [];

            foreach (SavingType::values() as $type) {
                $tx = $user->transactions()
                    ->where('direction', $dir)
                    ->where('type', $type)
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->orderByDesc('amount')
                    ->with('storageLocation')
                    ->first();

                if ($tx) {
                    $result[$dir][$type] = [
                        'amount' => $tx->amount,
                        'location' => $tx->storageLocation->name ?? 'Unknown',
                        'date' => $tx->created_at->format('d'),
                    ];
                } else {
                    $result[$dir][$type] = null;
                }
            }
        }

        return $result;
    }
}
