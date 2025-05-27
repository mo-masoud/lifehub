<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Folders\StoreRequest;
use App\Http\Requests\Dashboard\Folders\UpdateRequest;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $folders = Folder::where('user_id', $user->id)
            ->withCount(['passwords', 'sshs'])
            ->when(request('keyword'), function ($query) {
                $keyword = request('keyword');
                $query->where('name', 'like', "%{$keyword}%");
            })
            ->latest()
            ->paginate(10);

        return inertia('dashboard/folders/index', [
            'folders' => $folders,
            'filters' => request()->only(['keyword']),
        ]);
    }

    public function show(Request $request, Folder $folder)
    {
        /** @var User $user */
        $user = $request->user();

        if ($folder->user_id !== $user->id) {
            abort(403);
        }

        $passwords = $folder->passwords()
            ->when(request('password_keyword'), function ($query) {
                $query->where(function ($query) {
                    $keyword = request('password_keyword');
                    $query->where('name', 'like', "%{$keyword}%")
                        ->orWhere('username', 'like', "%{$keyword}%")
                        ->orWhere('url', 'like', "%{$keyword}%");
                });
            })
            ->latest()
            ->paginate(10, ['*'], 'passwords_page');

        $sshs = $folder->sshs()
            ->when(request('ssh_keyword'), function ($query) {
                $query->where(function ($query) {
                    $keyword = request('ssh_keyword');
                    $query->where('name', 'like', "%{$keyword}%")
                        ->orWhere('username', 'like', "%{$keyword}%")
                        ->orWhere('ip', 'like', "%{$keyword}%");
                });
            })
            ->latest()
            ->paginate(10, ['*'], 'sshs_page');

        return inertia('dashboard/folders/show', [
            'folder' => $folder,
            'passwords' => $passwords,
            'sshs' => $sshs,
            'filters' => request()->only(['password_keyword', 'ssh_keyword']),
        ]);
    }

    public function store(StoreRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validated();

        $folder = Folder::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
        ]);

        return redirect()->back()->with('success', __('dashboard.messages.updated_successfully'));
    }

    public function update(UpdateRequest $request, Folder $folder)
    {
        $validated = $request->validated();

        $folder->update($validated);

        return redirect()->back()->with('success', __('dashboard.messages.updated_successfully'));
    }

    public function destroy(Request $request, Folder $folder)
    {
        /** @var User $user */
        $user = $request->user();

        if ($folder->user_id !== $user->id) {
            abort(403);
        }

        // Check if folder has passwords or SSHs
        if ($folder->passwords()->count() > 0 || $folder->sshs()->count() > 0) {
            return redirect()->back()->withErrors(['error' => __('dashboard.messages.folder_has_items_cannot_delete')]);
        }

        $folder->delete();

        return redirect()->back()->with('success', __('dashboard.messages.deleted_successfully'));
    }
}
