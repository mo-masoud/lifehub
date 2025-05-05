<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\SavingsStatsService;

class HomeController extends Controller
{
    public function __invoke(SavingsStatsService $savingsStatsService) {
        $user = auth()->user();
        $savingsStats = $savingsStatsService->getStats($user);
        return inertia('dashboard/home/index', compact('savingsStats'));
    }
}
