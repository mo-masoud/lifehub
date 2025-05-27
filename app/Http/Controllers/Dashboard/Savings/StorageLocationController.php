<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\StoreStorageLocationRequest;
use App\Http\Requests\Dashboard\Savings\UpdateStorageLocationRequest;
use App\Models\SavingsStorageLocation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StorageLocationController extends Controller
{
    public function destroy(SavingsStorageLocation $storageLocation)
    {
        if ($storageLocation->transactions()->exists() || $storageLocation->initialSavings()->exists()) {
            return back()->withErrors('You can not delete this storage location because it has transactions or initial savings.');
        }

        $storageLocation->delete();

        return back()->with('success', 'Storage location deleted successfully');
    }

    public function index()
    {
        $storageLocations = SavingsStorageLocation::whereNull('user_id')
            ->orWhere('user_id', auth()->id())
            ->latest()
            ->paginate();

        $storageLocations->through(function ($location) {
            $balances = [
                'USD' => 0,
                'EGP' => 0,
                'GOLD24' => 0,
                'GOLD21' => 0,
            ];

            $total_egp = 0;

            foreach ($location->latestSnapshotItems as $item) {
                $balances[$item->type] = $item->amount;
                $total_egp += $item->amount * $item->rate;
            }

            return [
                'id' => $location->id,
                'name' => $location->name,
                'user_id' => $location->user_id,
                'balances' => $balances,
                'total_egp' => round($total_egp, 2),
            ];
        });

        return inertia('dashboard/savings/storage-locations/index', compact('storageLocations'));
    }

    public function store(StoreStorageLocationRequest $request)
    {
        $validated = $request->validated();

        SavingsStorageLocation::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Storage location created successfully');
    }

    public function update(UpdateStorageLocationRequest $request, SavingsStorageLocation $storageLocation)
    {
        $validated = $request->validated();

        $storageLocation->update([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Storage location updated successfully');
    }
}
