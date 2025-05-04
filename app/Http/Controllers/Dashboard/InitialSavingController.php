<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Savings\InitialSavings\StoreRequest;
use App\Http\Requests\Dashboard\Savings\InitialSavings\UpdateRequest;
use App\Models\InitialSaving;
use Inertia\Inertia;

class InitialSavingController extends Controller
{
    public function destroy(InitialSaving $initialSaving)
    {
        $initialSaving->delete();

        return redirect()->route('dashboard.savings.initial.index')->with('success', 'Initial saving deleted successfully.');
    }

    public function index()
    {
        $balances = InitialSaving::with('storageLocation')->latest()->paginate();

        return Inertia::render('dashboard/savings/initial-savings/index', compact('balances'));
    }

    public function store(StoreRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        InitialSaving::create($data);

        return redirect()->route('dashboard.savings.initial.index')->with('success', 'Initial saving created successfully.');
    }

    public function update(UpdateRequest $request, InitialSaving $initialSaving)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        $initialSaving->update($data);

        return redirect()->route('dashboard.savings.initial.index')->with('success', 'Initial saving updated successfully.');
    }
}
