<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\TransactionCategories\StoreRequest;
use App\Http\Requests\Dashboard\Savings\TransactionCategories\UpdateRequest;
use App\Models\TransactionCategory;
use Illuminate\Http\Request;

class TransactionCategoryController extends Controller
{
    public function destroy(TransactionCategory $transactionCategory)
    {
        if ($transactionCategory->transactions()->exists()) {
            return back()->withErrors('You cannot delete this transaction category because it has associated transactions.');
        }

        $transactionCategory->delete();

        return back()->with('success', 'Transaction category deleted successfully');
    }

    public function index(Request $request)
    {
        $transactionCategories = TransactionCategory::with('transactions')
            ->whereNull('user_id')
            ->orWhere('user_id', auth()->id())
            ->get();

        foreach ($transactionCategories as $category) {
            $category->total_amount = $category->transactions->sum('amount');
            $category->total_month = $category->transactions
                ->where('created_at', '>=', now()->subMonth())
                ->sum('amount');
            $category->total_week = $category->transactions
                ->where('created_at', '>=', now()->subWeek())
                ->sum('amount');
            $category->total_year = $category->transactions
                ->where('created_at', '>=', now()->subYear())
                ->sum('amount');
        }

        $orderBy = $request->get('order_by', 'name');
        $orderDirection = $request->get('order_direction', 'asc');
        $perPage = $request->get('per_page', 15); // Default items per page
        $currentPage = $request->get('page', 1); // Current page

        $transactionCategories = $transactionCategories->sortBy(
            $orderBy,
            SORT_REGULAR,
            $orderDirection === 'desc'
        );

        $paginatedCategories = $transactionCategories->slice(($currentPage - 1) * $perPage, $perPage)->values();

        $transactionCategories = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedCategories,
            $transactionCategories->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return inertia('dashboard/savings/transaction-categories/index', compact('transactionCategories'));
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        TransactionCategory::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'direction' => $validated['direction'],
        ]);

        return back()->with('success', 'Transaction category created successfully');
    }

    public function update(UpdateRequest $request, TransactionCategory $transactionCategory)
    {
        $validated = $request->validated();

        $transactionCategory->update([
            'name' => $validated['name'],
            'direction' => $validated['direction'],
        ]);

        return back()->with('success', 'Transaction category updated successfully');
    }
}
