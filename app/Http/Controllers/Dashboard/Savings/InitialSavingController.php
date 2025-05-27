<?php

namespace App\Http\Controllers\Dashboard\Savings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\InitialSavings\StoreRequest;
use App\Http\Requests\Dashboard\Savings\InitialSavings\UpdateRequest;
use App\Models\InitialSaving;
use App\Models\User;
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
        /** @var User $user */
        $user = $request->user();
        $data = $request->validated();
        $data['user_id'] = $user->id;

        InitialSaving::create($data);

        return back()->with('success', 'Initial saving created successfully.');
    }

    public function update(UpdateRequest $request, InitialSaving $initialSaving)
    {
        /** @var User $user */
        $user = $request->user();
        $data = $request->validated();
        $data['user_id'] = $user->id;

        $initialSaving->update($data);

        return back()->with('success', 'Initial saving updated successfully.');
    }

    public function complete(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        UserSetting::markInitialSavingsCompleted($user);
        (new CreateSnapshotService)->handle($user);

        return back()->with('success', 'Initial saving marked as completed successfully.');
    }
}
