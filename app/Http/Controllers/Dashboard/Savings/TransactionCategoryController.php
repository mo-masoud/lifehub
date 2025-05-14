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

    public function index()
    {
        $transactionCategories = TransactionCategory::whereNull('user_id')
            ->orWhere('user_id', Auth::id())
            ->latest()
            ->paginate();

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
