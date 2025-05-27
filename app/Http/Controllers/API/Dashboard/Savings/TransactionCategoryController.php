<?php

namespace App\Http\Controllers\API\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\TransactionCategories\StoreRequest;
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

    public function store(StoreRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validated();

        $existing = TransactionCategory::where(function (Builder $query) use ($user) {
            $query->where('user_id', $user->id)->orWhereNull('user_id');
        })->where('name', $validated['name'])
            ->where('direction', $validated['direction'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Category already exists.'], 409);
        }

        $category = TransactionCategory::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'direction' => $validated['direction'],
        ]);

        return response()->json($category, 201);
    }
}
