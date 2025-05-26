<?php

namespace App\Http\Controllers\Dashboard\PasswordsManager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\SSHs\StoreSSHRequest;
use App\Http\Requests\Dashboard\SSHs\UpdateSSHRequest;
use App\Models\SSH;
use App\Models\User;
use Illuminate\Http\Request;

class SSHController extends Controller
{
    public function destroy(Request $request, SSH $ssh)
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->cannot('delete', $ssh)) {
            return redirect()->route('dashboard.sshs.index')
                ->with('error', 'You do not have permission to delete this SSH.');
        }

        $ssh->delete();

        return redirect()->route('dashboard.sshs.index')->with('success', 'SSH deleted successfully.');
    }
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $sshs = SSH::where('user_id', $user->id)
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

        return inertia('dashboard/passwords-manager/sshs/index', [
            'sshs' => $sshs,
            'filters' => request()->only(['keyword']),
        ]);
    }
    public function store(StoreSSHRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validated();
        $data['user_id'] = $user->id;

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
