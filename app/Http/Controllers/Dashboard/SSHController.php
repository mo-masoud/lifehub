<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\SSHs\StoreSSHRequest;
use App\Http\Requests\Dashboard\SSHs\UpdateSSHRequest;
use App\Models\SSH;

class SSHController extends Controller
{
    public function destroy(SSH $ssh)
    {
        if (auth()->user()->cannot('delete', $ssh)) {
            return redirect()->route('dashboard.sshs.index')
                ->with('error', 'You do not have permission to delete this SSH.');
        }

        $ssh->delete();

        return redirect()->route('dashboard.sshs.index')->with('success', 'SSH deleted successfully.');
    }

    public function index()
    {
        $sshs = SSH::where('user_id', auth()->id())
            ->when(request('keyword'), function ($query) {
                $query->where(function ($query) {
                    $keyword = request('keyword');

                    $query->where('name', 'like', "%{$keyword}%")
                        ->orWhere('username', 'like', "%{$keyword}%")
                        ->orWhere('ip', 'like', "%{$keyword}%");
                });
            })
            ->latest()
            ->paginate();

        return inertia('dashboard/sshs/index', [
            'sshs' => $sshs,
            'filters' => request()->only(['keyword']),
        ]);
    }

    public function store(StoreSSHRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        if (isset($data['prompt'])) {
            $prompt = str_replace('ssh ', '', $data['prompt']);
            $prompt = explode('@', $prompt);
            $data['username'] = $prompt[0];
            $data['ip'] = $prompt[1];
        }

        SSH::create($data);

        return redirect()->route('dashboard.sshs.index')->with('success', 'SSH created successfully.');
    }

    public function update(UpdateSSHRequest $request, SSH $ssh)
    {
        $data = $request->validated();

        if (isset($data['prompt']) && !isset($data['username'], $data['ip'])) {
            $prompt = str_replace('ssh ', '', $data['prompt']);
            $prompt = explode('@', $prompt);
            $data['username'] = $prompt[0];
            $data['ip'] = $prompt[1];
        }

        $ssh->update($data);

        return redirect()->route('dashboard.sshs.index')->with('success', 'SSH updated successfully.');
    }
}
