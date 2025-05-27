<?php

namespace App\Http\Controllers\Dashboard\PasswordsManager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Passwords\StoreRequest;
use App\Http\Requests\Dashboard\Passwords\UpdateRequest;
use App\Models\Password;
use App\Models\User;
use Illuminate\Http\Request;

class PasswordController extends Controller
{
    public function destroy(Request $request, Password $password)
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->cannot('delete', $password)) {
            return redirect()->route('dashboard.passwords.index')
                ->with('error', 'You do not have permission to delete this password.');
        }

        $password->delete();

        return redirect()->route('dashboard.passwords.index')->with('success', 'Password deleted successfully.');
    }
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $passwords = Password::where('user_id', $user->id)
            ->with('folder')
            ->when(request('keyword'), function ($query) {
                $query->where(function ($query) {
                    $keyword = request('keyword');

                    $query->where('name', 'like', "%{$keyword}%")
                        ->orWhere('username', 'like', "%{$keyword}%")
                        ->orWhere('url', 'like', "%{$keyword}%");
                });
            })
            ->when(request('folder_id'), function ($query) {
                $folderId = request('folder_id');
                if ($folderId === 'no_folder') {
                    $query->whereNull('folder_id');
                } else {
                    $query->where('folder_id', $folderId);
                }
            })
            ->latest()
            ->paginate();

        return inertia('dashboard/passwords-manager/passwords/index', [
            'passwords' => $passwords,
            'filters' => request()->only(['keyword', 'folder_id']),
        ]);
    }
    public function store(StoreRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validated();
        $data['user_id'] = $user->id;
        Password::create($data);

        return redirect()->route('dashboard.passwords.index')->with('success', 'Password created successfully.');
    }

    public function update(UpdateRequest $request, Password $password)
    {
        $password->update($request->validated());

        return redirect()->route('dashboard.passwords.index')->with('success', 'Password updated successfully.');
    }
}
