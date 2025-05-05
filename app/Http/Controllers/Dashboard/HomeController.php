<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\SavingsStatsService;

class HomeController extends Controller
{
    public function __invoke(SavingsStatsService $savingsStatsService) {
        $user = auth()->user();
        $savingsStats = $savingsStatsService->getStats($user);
        $fallbackRates = $user->settings()->whereIn('key', [
            'usd_rate_fallback',
            'gold24_rate_fallback',
            'gold21_rate_fallback',
        ])->pluck('value', 'key');

        return inertia('dashboard/home/index', compact('savingsStats', 'fallbackRates'));
    }
}
