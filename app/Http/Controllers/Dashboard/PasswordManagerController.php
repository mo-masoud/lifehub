<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Passwords\StorePasswordRequest;
use App\Http\Requests\Dashboard\Passwords\UpdatePasswordRequest;
use App\Models\Password;

class PasswordManagerController extends Controller
{
    public function destroy(Password $password)
    {
        if (auth()->user()->cannot('delete', $password)) {
            return redirect()->route('dashboard.passwords.index')
                ->with('error', 'You do not have permission to delete this password.');
        }

        $password->delete();

        return redirect()->route('dashboard.passwords.index')->with('success', 'Password deleted successfully.');
    }

    public function index()
    {
        $passwords = Password::where('user_id', auth()->id())
            ->when(request('keyword'), function ($query) {
                $query->where(function ($query) {
                    $keyword = request('keyword');

                    $query->where('name', 'like', "%{$keyword}%")
                        ->orWhere('username', 'like', "%{$keyword}%")
                        ->orWhere('url', 'like', "%{$keyword}%");
                });
            })
            ->latest()
            ->paginate();

        return inertia('dashboard/passwords/index', [
            'passwords' => $passwords,
            'filters' => request()->only(['keyword']),
        ]);
    }

    public function store(StorePasswordRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();
        Password::create($data);

        return redirect()->route('dashboard.passwords.index')->with('success', 'Password created successfully.');
    }

    public function update(UpdatePasswordRequest $request, Password $password)
    {
        $password->update($request->validated());
        
        return redirect()->route('dashboard.passwords.index')->with('success', 'Password updated successfully.');
    }
}
