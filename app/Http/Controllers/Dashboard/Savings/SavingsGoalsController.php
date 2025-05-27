<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\SavingsGoals\StoreRequest;
use App\Http\Requests\Dashboard\Savings\SavingsGoals\UpdateRequest;
use App\Models\SavingsGoal;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalsController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $user = auth()->user();
        if (!$user) {
            abort(401);
        }

        $goals = $user->savingsGoals()
            ->orderByDesc('severity')
            ->orderBy('target_date')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('dashboard/savings/goals/index', [
            'goals' => $goals,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        // Convert to USD if needed
        $targetAmountUsd = $validated['target_amount'];

        $user = $request->user();

        if ($validated['currency'] === 'EGP') {
            $targetAmountUsd = SavingsGoal::convertEgpToUsd($validated['target_amount'], $user);
        }

        $goal = $user->savingsGoals()->create([
            'title' => $validated['title'],
            'target_amount_usd' => $targetAmountUsd,
            'severity' => $validated['severity'],
            'target_date' => $validated['target_date'],
        ]);

        // Check if already achieved
        $goal->checkAndUpdateAchievement();

        return redirect()->back()->with('success', __('messages.created_successfully'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, SavingsGoal $savingsGoal)
    {
        $validated = $request->validated();

        // Convert to USD if needed
        $targetAmountUsd = $validated['target_amount'];

        $user = $request->user();

        if ($validated['currency'] === 'EGP') {
            $targetAmountUsd = SavingsGoal::convertEgpToUsd($validated['target_amount'], $user);
        }

        $savingsGoal->update([
            'title' => $validated['title'],
            'target_amount_usd' => $targetAmountUsd,
            'severity' => $validated['severity'],
            'target_date' => $validated['target_date'],
        ]);

        // Check if newly achieved after update
        $savingsGoal->checkAndUpdateAchievement();

        return redirect()->back()->with('success', __('messages.updated_successfully'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SavingsGoal $savingsGoal)
    {
        $this->authorize('delete', $savingsGoal);

        $savingsGoal->delete();

        return redirect()->back()->with('success', __('messages.deleted_successfully'));
    }

    /**
     * Mark goal as achieved manually
     */
    public function markAsAchieved(SavingsGoal $savingsGoal)
    {
        $this->authorize('update', $savingsGoal);

        $savingsGoal->markAsAchieved();

        return redirect()->back()->with('success', __('Goal marked as achieved!'));
    }

    /**
     * Dismiss success notification
     */
    public function dismissSuccessNotification(SavingsGoal $savingsGoal)
    {
        $this->authorize('update', $savingsGoal);

        $savingsGoal->dismissSuccessNotification();

        return redirect()->back();
    }
}
