<?php

namespace App\Http\Controllers\API\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Models\SavingsStorageLocation;
use App\Models\TransactionCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TransactionCategoryController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $userId = $user->id;

        $locations = TransactionCategory::whereNull('user_id')
            ->orWhere('user_id', $userId)
            ->orderBy('name')
            ->get(['id', 'name', 'direction']);

        return response()->json($locations);
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'direction' => ['required', 'string', 'in:in,out'],
        ]);

        $existing = SavingsStorageLocation::where(function (Builder $query) use ($user) {
            $query->where('user_id', $user->id)->orWhereNull('user_id');
        })->where('name', $request->name)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Category already exists.'], 409);
        }

        $location = TransactionCategory::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'direction' => $request->direction,
        ]);

        return response()->json($location, 201);
    }
}
