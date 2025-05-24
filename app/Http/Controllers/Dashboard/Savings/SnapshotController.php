<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Models\Snapshot;
use App\Models\User;
use App\Services\CreateSnapshotService;
use Illuminate\Http\Request;
use Throwable;

class SnapshotController extends Controller
{
    public function destroy(Request $request, Snapshot $snapshot)
    {
        if ($snapshot->items->count() === 1) {
            return back()->withErrors('You can not delete this snapshot because it has only one item.');
        }

        /** @var User $user */
        $user = $request->user();
        if ($user->id !== $snapshot->user_id) {
            return back()->withErrors('You can not delete this snapshot because it belongs to another user.');
        }

        $snapshot->delete();

        return back()->with('success', 'Snapshot deleted successfully');
    }

    public function index()
    {
        $snapshots = Snapshot::with('items.storageLocation')->latest()->paginate();

        return inertia('dashboard/savings/snapshots', compact('snapshots'));
    }

    public function store(Request $request, CreateSnapshotService $service)
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $service->handle($user);
            return back()->with('success', 'Snapshot created successfully');
        } catch (Throwable $th) {
            return back()->withErrors(__('dashboard.messages.something_went_wrong'));
        }
    }
}
