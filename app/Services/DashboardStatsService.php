<?php

namespace App\Services;

use App\Models\Snapshot;
use App\Models\Transaction;
use App\Models\UserSetting;
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

    /**
     * Get the top transaction spent for different time periods
     *
     * @return array
     */
    public function getTopTransactionsByPeriod(): array
    {
        $userId = Auth::id();
        $now = now();

        // Define time periods
        $weekStart = $now->copy()->startOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $quarterStart = $now->copy()->startOfQuarter();
        $yearStart = $now->copy()->startOfYear();

        // Get top transaction for each period
        $topWeekTransaction = $this->getTopTransactionForPeriod($userId, $weekStart, 'week');
        $topMonthTransaction = $this->getTopTransactionForPeriod($userId, $monthStart, 'month');
        $topQuarterTransaction = $this->getTopTransactionForPeriod($userId, $quarterStart, 'quarter');
        $topYearTransaction = $this->getTopTransactionForPeriod($userId, $yearStart, 'year');

        return [
            'week' => $topWeekTransaction,
            'month' => $topMonthTransaction,
            'quarter' => $topQuarterTransaction,
            'year' => $topYearTransaction,
        ];
    }

    /**
     * Get the top transaction for a specific time period
     *
     * @param int $userId
     * @param \Carbon\Carbon $startDate
     * @param string $periodName
     * @return array|null
     */
    private function getTopTransactionForPeriod(int $userId, $startDate, string $periodName): ?array
    {
        $transaction = Transaction::where('user_id', $userId)
            ->where('direction', TransactionDirection::OUT->value)
            ->where('date', '>=', $startDate->toDateString())
            ->orderByDesc('amount')
            ->with(['category', 'storageLocation'])
            ->first();

        if (!$transaction) {
            return null;
        }

        // Get conversion rates from user settings
        $usdRate = (float) UserSetting::get(Auth::user(), 'usd_rate_fallback', 1);
        $gold24Rate = (float) UserSetting::get(Auth::user(), 'gold24_rate_fallback', 1);
        $gold21Rate = (float) UserSetting::get(Auth::user(), 'gold21_rate_fallback', 1);

        // Get transaction type from the storage location
        $type = $transaction->type ?? 'EGP';

        // Calculate amounts in EGP and USD
        $amountEgp = $transaction->amount;
        $amountUsd = $transaction->amount;

        // Convert based on type
        switch ($type) {
            case 'USD':
                $amountEgp = $transaction->amount * $usdRate;
                break;
            case 'GOLD24':
                $amountEgp = $transaction->amount * $gold24Rate;
                $amountUsd = $amountEgp / $usdRate;
                break;
            case 'GOLD21':
                $amountEgp = $transaction->amount * $gold21Rate;
                $amountUsd = $amountEgp / $usdRate;
                break;
            case 'EGP':
            default:
                $amountUsd = $transaction->amount / $usdRate;
                break;
        }

        return [
            'amount' => $transaction->amount,
            'amount_egp' => $amountEgp,
            'amount_usd' => $amountUsd,
            'date' => $transaction->date,
            'category' => $transaction->category?->name,
            'category_id' => $transaction->category?->id,
            'notes' => $transaction->notes,
            'period' => $periodName,
            'type' => $type,
        ];
    }

    /**
     * Get total expenses (outcomes) for each time period in EGP
     *
     * @return array
     */
    public function getTotalExpensesByPeriod(): array
    {
        $userId = Auth::id();
        $now = now();

        // Define time periods
        $weekStart = $now->copy()->startOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $quarterStart = $now->copy()->startOfQuarter();
        $yearStart = $now->copy()->startOfYear();

        // Get total expenses for each period
        $weekExpenses = $this->getTotalForPeriod($userId, $weekStart, TransactionDirection::OUT);
        $monthExpenses = $this->getTotalForPeriod($userId, $monthStart, TransactionDirection::OUT);
        $quarterExpenses = $this->getTotalForPeriod($userId, $quarterStart, TransactionDirection::OUT);
        $yearExpenses = $this->getTotalForPeriod($userId, $yearStart, TransactionDirection::OUT);

        return [
            'week' => $weekExpenses,
            'month' => $monthExpenses,
            'quarter' => $quarterExpenses,
            'year' => $yearExpenses,
        ];
    }

    /**
     * Get total income for each time period in EGP
     *
     * @return array
     */
    public function getTotalIncomeByPeriod(): array
    {
        $userId = Auth::id();
        $now = now();

        // Define time periods
        $weekStart = $now->copy()->startOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $quarterStart = $now->copy()->startOfQuarter();
        $yearStart = $now->copy()->startOfYear();

        // Get total income for each period
        $weekIncome = $this->getTotalForPeriod($userId, $weekStart, TransactionDirection::IN);
        $monthIncome = $this->getTotalForPeriod($userId, $monthStart, TransactionDirection::IN);
        $quarterIncome = $this->getTotalForPeriod($userId, $quarterStart, TransactionDirection::IN);
        $yearIncome = $this->getTotalForPeriod($userId, $yearStart, TransactionDirection::IN);

        return [
            'week' => $weekIncome,
            'month' => $monthIncome,
            'quarter' => $quarterIncome,
            'year' => $yearIncome,
        ];
    }

    /**
     * Get total amount for a specific time period and direction
     *
     * @param int $userId
     * @param \Carbon\Carbon $startDate
     * @param TransactionDirection $direction
     * @return float
     */
    private function getTotalForPeriod(int $userId, $startDate, TransactionDirection $direction): float
    {
        return Transaction::where('user_id', $userId)
            ->where('direction', $direction->value)
            ->where('date', '>=', $startDate->toDateString())
            ->sum('amount');
    }
}
