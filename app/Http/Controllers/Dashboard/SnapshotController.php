<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Snapshot;
use App\Services\CreateSnapshotService;
use Illuminate\Http\Request;
use Throwable;

class SnapshotController extends Controller
{
    public function index()
    {
        $snapshots = Snapshot::with('items.storageLocation')->latest()->paginate();

        return inertia('dashboard/savings/snapshots', compact('snapshots'));
    }

    public function store(Request $request, CreateSnapshotService $service)
    {
        try {
            $service->handle($request->user());
            return back()->with('success', 'Snapshot created successfully');
        } catch (Throwable $th) {
            return back()->withErrors(__('dashboard.messages.something_went_wrong'));
        }
    }
}
