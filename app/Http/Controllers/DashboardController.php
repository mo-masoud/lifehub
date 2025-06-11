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
        $recentPasswords = $this->passwordQueryService->getFilteredPasswords(
            $user,
            ['sort' => 'last_used_at', 'direction' => 'desc'],
            paginate: false
        )->take(5);

        return Inertia::render('dashboard', [
            'recentPasswords' => $recentPasswords,
        ]);
    }
}
