<?php

namespace App\Services;

use App\Models\Snapshot;
use App\Models\Transaction;
use App\Enums\TransactionDirection;
use Illuminate\Support\Facades\Auth;

class DashboardStatsService
{
    /**
     * Get the latest snapshot with totals in EGP and USD
     *
     * @return array|null
     */
    public function getLatestSnapshotTotals(): ?array
    {
        $latestSnapshot = Snapshot::where('user_id', Auth::id())
            ->latest()
            ->first();

        if (!$latestSnapshot) {
            return null;
        }

        return [
            'date' => $latestSnapshot->date,
            'total_egp' => $latestSnapshot->total_egp,
            'total_usd' => $latestSnapshot->total_usd,
        ];
    }
}
