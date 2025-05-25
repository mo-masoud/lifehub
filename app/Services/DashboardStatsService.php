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
        // Get user and conversion rates
        $user = Auth::user();
        if (!$user) {
            return null;
        }

        $usdRate = $user->getUsdRateFallback();
        $gold24Rate = $user->getGold24RateFallback();
        $gold21Rate = $user->getGold21RateFallback();

        // Get all transactions for the period and convert to EGP for proper comparison
        $transactions = Transaction::where('user_id', $userId)
            ->where('direction', TransactionDirection::OUT->value)
            ->where('created_at', '>=', $startDate)
            ->with(['category', 'storageLocation'])
            ->get();

        if ($transactions->isEmpty()) {
            return null;
        }

        // Convert all transactions to EGP and find the highest
        $topTransaction = null;
        $maxAmountEgp = 0;

        foreach ($transactions as $transaction) {
            // Get transaction type (stored directly on transaction)
            $type = $transaction->type ?? 'EGP';

            // Calculate amount in EGP for comparison
            $amountEgp = $transaction->amount;

            switch ($type) {
                case 'USD':
                    $amountEgp = $transaction->amount * $usdRate;
                    break;
                case 'GOLD24':
                    $amountEgp = $transaction->amount * $gold24Rate;
                    break;
                case 'GOLD21':
                    $amountEgp = $transaction->amount * $gold21Rate;
                    break;
                case 'EGP':
                default:
                    // Amount is already in EGP
                    break;
            }

            // Check if this is the highest transaction in EGP equivalent
            if ($amountEgp > $maxAmountEgp) {
                $maxAmountEgp = $amountEgp;
                $topTransaction = $transaction;
            }
        }

        if (!$topTransaction) {
            return null;
        }

        // Calculate final amounts for the top transaction
        $type = $topTransaction->type ?? 'EGP';
        $amountEgp = $topTransaction->amount;
        $amountUsd = $topTransaction->amount;

        // Convert based on type for display
        switch ($type) {
            case 'USD':
                $amountEgp = $topTransaction->amount * $usdRate;
                $amountUsd = $topTransaction->amount; // Already in USD
                break;
            case 'GOLD24':
                $amountEgp = $topTransaction->amount * $gold24Rate;
                $amountUsd = $amountEgp / $usdRate;
                break;
            case 'GOLD21':
                $amountEgp = $topTransaction->amount * $gold21Rate;
                $amountUsd = $amountEgp / $usdRate;
                break;
            case 'EGP':
            default:
                $amountUsd = $topTransaction->amount / $usdRate;
                // $amountEgp is already correct
                break;
        }

        return [
            'amount' => $topTransaction->amount,
            'amount_egp' => round($amountEgp, 2),
            'amount_usd' => round($amountUsd, 2),
            'date' => $topTransaction->date,
            'category' => $topTransaction->category?->name,
            'category_id' => $topTransaction->category?->id,
            'notes' => $topTransaction->notes,
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
        // Get user and conversion rates
        $user = Auth::user();
        if (!$user) {
            return 0;
        }

        $usdRate = $user->getUsdRateFallback();
        $gold24Rate = $user->getGold24RateFallback();
        $gold21Rate = $user->getGold21RateFallback();

        // Get all transactions for the period
        $transactions = Transaction::where('user_id', $userId)
            ->where('direction', $direction->value)
            ->where('created_at', '>=', $startDate)
            ->get();

        $totalEgp = 0;

        foreach ($transactions as $transaction) {
            $type = $transaction->type ?? 'EGP';

            // Convert amount to EGP
            $amountEgp = $transaction->amount;
            switch ($type) {
                case 'USD':
                    $amountEgp = $transaction->amount * $usdRate;
                    break;
                case 'GOLD24':
                    $amountEgp = $transaction->amount * $gold24Rate;
                    break;
                case 'GOLD21':
                    $amountEgp = $transaction->amount * $gold21Rate;
                    break;
                case 'EGP':
                default:
                    // Amount is already in EGP
                    break;
            }

            $totalEgp += $amountEgp;
        }

        return round($totalEgp, 2);
    }

    /**
     * Get top spending categories for different time periods
     *
     * @return array
     */
    public function getTopCategoriesByPeriod(): array
    {
        $userId = Auth::id();
        $now = now();

        // Define time periods
        $weekStart = $now->copy()->startOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $quarterStart = $now->copy()->startOfQuarter();
        $yearStart = $now->copy()->startOfYear();

        return [
            'week' => $this->getTopCategoriesForPeriod($userId, $weekStart),
            'month' => $this->getTopCategoriesForPeriod($userId, $monthStart),
            'quarter' => $this->getTopCategoriesForPeriod($userId, $quarterStart),
            'year' => $this->getTopCategoriesForPeriod($userId, $yearStart),
            'overall' => $this->getTopCategoriesForPeriod($userId, null), // All time
        ];
    }

    /**
     * Get top 3 categories for a specific time period
     *
     * @param int $userId
     * @param \Carbon\Carbon|null $startDate
     * @return array
     */
    private function getTopCategoriesForPeriod(int $userId, $startDate = null): array
    {
        // Get user and conversion rates
        $user = Auth::user();
        if (!$user) {
            return [];
        }

        $usdRate = $user->getUsdRateFallback();
        $gold24Rate = $user->getGold24RateFallback();
        $gold21Rate = $user->getGold21RateFallback();

        // Get all transactions for the period
        $query = Transaction::where('user_id', $userId)
            ->where('direction', TransactionDirection::OUT->value)
            ->with('category');

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        $transactions = $query->get();

        if ($transactions->isEmpty()) {
            return [];
        }

        // Group transactions by category and convert to EGP
        $categoryTotals = [];

        foreach ($transactions as $transaction) {
            if (!$transaction->category) {
                continue;
            }

            $categoryId = $transaction->category->id;
            $type = $transaction->type ?? 'EGP';

            // Convert amount to EGP
            $amountEgp = $transaction->amount;
            switch ($type) {
                case 'USD':
                    $amountEgp = $transaction->amount * $usdRate;
                    break;
                case 'GOLD24':
                    $amountEgp = $transaction->amount * $gold24Rate;
                    break;
                case 'GOLD21':
                    $amountEgp = $transaction->amount * $gold21Rate;
                    break;
                case 'EGP':
                default:
                    // Amount is already in EGP
                    break;
            }

            // Add to category total
            if (!isset($categoryTotals[$categoryId])) {
                $categoryTotals[$categoryId] = [
                    'category' => $transaction->category,
                    'total_egp' => 0,
                ];
            }

            $categoryTotals[$categoryId]['total_egp'] += $amountEgp;
        }

        // Sort by total and get top 3
        uasort($categoryTotals, function ($a, $b) {
            return $b['total_egp'] <=> $a['total_egp'];
        });

        $result = [];
        $count = 0;

        foreach ($categoryTotals as $categoryData) {
            if ($count >= 3) {
                break;
            }

            $result[] = [
                'id' => $categoryData['category']->id,
                'name' => $categoryData['category']->name,
                'total_egp' => round($categoryData['total_egp'], 2),
                'total_usd' => round($categoryData['total_egp'] / $usdRate, 2),
            ];

            $count++;
        }

        return $result;
    }
}
