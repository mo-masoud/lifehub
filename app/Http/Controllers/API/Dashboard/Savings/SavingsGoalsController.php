<?php

namespace App\Http\Controllers\API\Dashboard\Savings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SavingsGoalsController extends Controller
{
    /**
     * Get goals for API (used by dashboard widgets)
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        if (! $user) {
            abort(401);
        }

        $query = $user->savingsGoals();

        if ($request->get('important')) {
            $query->important();
        }

        if ($request->get('active')) {
            $query->active();
        }

        $goals = $query->orderByDesc('severity')
            ->orderBy('target_date')
            ->orderByDesc('created_at')
            ->limit($request->get('limit', 10))
            ->get();

        return response()->json($goals);
    }
}
