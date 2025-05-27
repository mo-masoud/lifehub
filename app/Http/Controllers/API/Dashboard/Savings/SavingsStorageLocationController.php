<?php

namespace App\Http\Controllers\API\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\StoreStorageLocationRequest;
use App\Models\SavingsStorageLocation;
use Illuminate\Http\Request;

class SavingsStorageLocationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $locations = SavingsStorageLocation::whereNull('user_id')
            ->orWhere('user_id', $userId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($locations);
    }

    public function store(StoreStorageLocationRequest $request)
    {
        $validated = $request->validated();

        $existing = SavingsStorageLocation::where('user_id', $request->user()->id)
            ->where('name', $validated['name'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Storage location already exists.'], 409);
        }

        $location = SavingsStorageLocation::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
        ]);

        return response()->json($location, 201);
    }
}
