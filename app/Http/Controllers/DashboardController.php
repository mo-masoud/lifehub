<?php

namespace App\Http\Controllers;

use App\Services\PasswordQueryService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected PasswordQueryService $passwordQueryService
    ) {}

    /**
     * Display the dashboard.
     */
    public function index()
    {
        $user = auth()->user();

        // Get recent passwords (last 5 used)
        $recentPasswords = $this->passwordQueryService->getRecentlyUsedPasswords($user, 5);

        // Get expiring passwords (next 3 days, limit 5)
        $expiringPasswords = $this->passwordQueryService->getFilteredPasswords(
            $user,
            ['expiry_filter' => 'expires_soon', 'sort' => 'expires_at', 'direction' => 'asc'],
            paginate: false
        )->take(5);

        // Get expired passwords (last 30 days, limit 5)
        $expiredPasswords = $this->passwordQueryService->getRecentlyExpiredPasswords($user, 5);

        return Inertia::render('dashboard', [
            'recentPasswords' => $recentPasswords,
            'expiringPasswords' => $expiringPasswords,
            'expiredPasswords' => $expiredPasswords,
        ]);
    }
}
