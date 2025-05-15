<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Models\TransactionCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            ->orWhere('user_id', Auth::id())
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

    private function validateAndCheckExisting(Request $request, ?TransactionCategory $transactionCategory = null): void
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'direction' => ['required', 'string'],
        ]);

        $query = TransactionCategory::where(function (Builder $query) {
            $query->where('user_id', Auth::id())->orWhereNull('user_id');
        })
            ->whereRaw('LOWER(name) = ?', [strtolower($request->name)])
            ->where('direction', $request->direction);

        if ($transactionCategory) {
            $query->where('id', '!=', $transactionCategory->id);
        }

        if ($query->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'name' => 'Transaction category already exists.',
            ]);
        }
    }

    public function store(Request $request)
    {
        $this->validateAndCheckExisting($request);

        TransactionCategory::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'direction' => $request->direction,
        ]);

        return back()->with('success', 'Transaction category created successfully');
    }

    public function update(Request $request, TransactionCategory $transactionCategory)
    {
        $this->validateAndCheckExisting($request, $transactionCategory);

        $transactionCategory->update([
            'name' => $request->name,
            'direction' => $request->direction,
        ]);

        return back()->with('success', 'Transaction category updated successfully');
    }
}
