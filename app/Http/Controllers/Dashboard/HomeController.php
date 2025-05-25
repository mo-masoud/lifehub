<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use App\Models\User;
use App\Services\DashboardStatsService;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    protected DashboardStatsService $dashboardStatsService;

    public function __construct(DashboardStatsService $dashboardStatsService)
    {
        $this->dashboardStatsService = $dashboardStatsService;
    }

    public function __invoke(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $hasCompletedInitialSavings = UserSetting::hasCompletedInitialSavings($user);

        $data = [
            'usdRateFallback' => $user->getUsdRateFallback(),
            'gold24RateFallback' => $user->getGold24RateFallback(),
            'gold21RateFallback' => $user->getGold21RateFallback(),
        ];

        if ($hasCompletedInitialSavings) {
            // User has completed initial savings, show regular stats
            $data = array_merge($data, [
                'latestSnapshotTotals' => $this->dashboardStatsService->getLatestSnapshotTotals(),
                'topTransactions' => $this->dashboardStatsService->getTopTransactionsByPeriod(),
                'totalExpenses' => $this->dashboardStatsService->getTotalExpensesByPeriod(),
                'totalIncome' => $this->dashboardStatsService->getTotalIncomeByPeriod(),
            ]);
        } else {
            // User hasn't completed initial savings, show initial savings data
            $data = array_merge($data, [
                'initialSavings' => $user->initialSavings()->with('storageLocation')->get(),
            ]);
        }

        return inertia('dashboard/home/index', $data);
    }
}
