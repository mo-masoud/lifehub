<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\Transaction\StoreRequest;
use App\Http\Requests\Dashboard\Savings\Transaction\UpdateRequest;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function destroy(Transaction $transaction)
    {
        if (Auth::id() !== $transaction->user_id) {
            return back()->with('error', 'You do not have permission to delete this transaction.');
        }
        $transaction->delete();

        return back()->with('success', 'Transaction deleted successfully.');
    }

    public function index(Request $request)
    {
        $filters['direction'] = $request->direction;
        $filters['type'] = $request->type;
        $filters['fromType'] = $request->from_type;
        $filters['storage'] = $request->storage_location;
        $filters['category'] = $request->category;
        $filters['minAmount'] = $request->min_amount;
        $filters['maxAmount'] = $request->max_amount;
        $filters['minDate'] = $request->min_date;
        $filters['maxDate'] = $request->max_date;

        $transactions = Transaction::with('storageLocation', 'category')
            ->where('user_id', Auth::id())
            ->when($filters['direction'], fn($q) => $q->where('direction', $filters['direction']))
            ->when($filters['type'], fn($q) => $q->where('type', $filters['type']))
            ->when($filters['fromType'], fn($q) => $q->where('from_type', $filters['fromType']))
            ->when($filters['storage'], fn($q) => $q->where('storage_location_id', $filters['storage']))
            ->when($filters['minAmount'], fn($q) => $q->where('amount', '>=', $filters['minAmount']))
            ->when($filters['maxAmount'], fn($q) => $q->where('amount', '<=', $filters['maxAmount']))
            ->when($filters['minDate'], fn($q) => $q->whereDate('created_at', '>=', Carbon::parse($filters['minDate'])))
            ->when($filters['maxDate'], fn($q) => $q->whereDate('created_at', '<=', Carbon::parse($filters['maxDate'])))
            ->when($filters['category'], fn($q) => $q->where('transaction_category_id', $filters['category']))
            ->latest()
            ->paginate();

        return inertia('dashboard/savings/transactions/index', compact('transactions', 'filters'));
    }

    public function store(StoreRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();
        $data['from_type'] = $data['direction'] === 'transfer' ? $data['from_type'] : null;
        $data['from_amount'] = $data['direction'] === 'transfer' ? $data['from_amount'] : null;

        Transaction::create($data);

        return back()->with('success', 'Transaction created successfully.');
    }

    public function update(Transaction $transaction, UpdateRequest $request)
    {
        $data = $request->validated();
        $data['from_type'] = $data['direction'] === 'transfer' ? $data['from_type'] : null;
        $data['from_amount'] = $data['direction'] === 'transfer' ? $data['from_amount'] : null;

        $transaction->update($data);

        return back()->with('success', 'Transaction updated successfully.');
    }
}
