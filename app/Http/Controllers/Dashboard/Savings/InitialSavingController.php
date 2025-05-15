<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\InitialSavings\StoreRequest;
use App\Http\Requests\Dashboard\Savings\InitialSavings\UpdateRequest;
use App\Models\InitialSaving;
use App\Models\UserSetting;
use App\Services\CreateSnapshotService;
use Illuminate\Http\Request;

class InitialSavingController extends Controller
{
    public function destroy(InitialSaving $initialSaving)
    {
        $initialSaving->delete();

        return back()->with('success', 'Initial saving deleted successfully.');
    }

    public function store(StoreRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        InitialSaving::create($data);

        return back()->with('success', 'Initial saving created successfully.');
    }

    public function update(UpdateRequest $request, InitialSaving $initialSaving)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $initialSaving->update($data);

        return back()->with('success', 'Initial saving updated successfully.');
    }

    public function complete(Request $request)
    {
        UserSetting::markInitialSavingsCompleted($request->user());

        new CreateSnapshotService()->handle($request->user());

        return back()->with('success', 'Initial saving marked as completed successfully.');
    }
}
