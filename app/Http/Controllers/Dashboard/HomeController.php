<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use App\Services\SavingsStatsService;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function __invoke(SavingsStatsService $savingsStatsService)
    {
        /**
         * @var \App\Models\User $user
         */
        $user = Auth::user();

        $savingsStats = $savingsStatsService->getStats($user);
        $fallbackRates = $user->settings()->whereIn('key', [
            'usd_rate_fallback',
            'gold24_rate_fallback',
            'gold21_rate_fallback',
        ])->pluck('value', 'key');

        $initialSavings = $user->initialSavings()->with('storageLocation')->get();

        return inertia('dashboard/home/index', [
            'savings_stats' => $savingsStats,
            'fallback_rates' => $fallbackRates,
            'initial_savings' => $initialSavings,
        ]);
    }
}
