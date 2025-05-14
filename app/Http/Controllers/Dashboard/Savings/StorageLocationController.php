<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Models\SavingsStorageLocation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            ->orWhere('user_id', Auth::id())
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

    private function validateAndCheckExisting(Request $request, ?SavingsStorageLocation $storageLocation = null): void
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $query = SavingsStorageLocation::where(function (Builder $query) {
            $query->where('user_id', Auth::id())->orWhereNull('user_id');
        })
            ->whereRaw('LOWER(name) = ?', [strtolower($request->name)]);

        if ($storageLocation) {
            $query->where('id', '!=', $storageLocation->id);
        }

        if ($query->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'name' => 'Storage location already exists.',
            ]);
        }
    }

    public function store(Request $request)
    {
        $this->validateAndCheckExisting($request);

        SavingsStorageLocation::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
        ]);

        return back()->with('success', 'Storage location created successfully');
    }

    public function update(Request $request, SavingsStorageLocation $storageLocation)
    {
        $this->validateAndCheckExisting($request, $storageLocation);

        $storageLocation->update([
            'name' => $request->name,
        ]);

        return back()->with('success', 'Storage location updated successfully');
    }
}
