<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\DashboardStatsService;

class HomeController extends Controller
{
    protected DashboardStatsService $dashboardStatsService;

    public function __construct(DashboardStatsService $dashboardStatsService)
    {
        $this->dashboardStatsService = $dashboardStatsService;
    }

    public function __invoke()
    {
        $latestSnapshotTotals = $this->dashboardStatsService->getLatestSnapshotTotals();

        return inertia('dashboard/home/index', [
            'latestSnapshotTotals' => $latestSnapshotTotals,
        ]);
    }
}
