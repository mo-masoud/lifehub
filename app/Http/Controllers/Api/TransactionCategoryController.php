<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransactionCategory;
use Illuminate\Http\Request;

class TransactionCategoryController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $locations = TransactionCategory::whereNull('user_id')
            ->orWhere('user_id', $userId)
            ->orderBy('name')
            ->get(['id', 'name', 'direction']);

        return response()->json($locations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'direction' => ['required', 'string', 'in:in,out'],
        ]);

        $existing = TransactionCategory::where('user_id', $request->user()->id)
            ->where('name', $request->name)
            ->where('direction', $request->direction)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Category already exists.'], 409);
        }

        $location = TransactionCategory::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'direction' => $request->direction,
        ]);

        return response()->json($location, 201);
    }
}
