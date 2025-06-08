<?php

namespace App\Http\Controllers;

use App\Http\Requests\Folders\StoreFolderRequest;
use App\Http\Requests\Folders\UpdateFolderRequest;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FolderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $folders = auth()->user()->folders()
            ->withCount('passwords')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->sort && $request->direction, function ($query) use ($request) {
                $sortField = $request->sort;
                $direction = $request->direction === 'desc' ? 'desc' : 'asc';

                if ($sortField === 'passwords_count') {
                    $query->orderBy('passwords_count', $direction);
                } elseif ($sortField === 'name') {
                    $query->orderBy('name', $direction);
                } elseif ($sortField === 'created_at') {
                    $query->orderBy('created_at', $direction);
                } elseif ($sortField === 'updated_at') {
                    $query->orderBy('updated_at', $direction);
                }
            }, function ($query) {
                // Default ordering
                $query->ordered();
            })
            ->paginate($request->per_page ?? 10);

        return Inertia::render('folders/index', [
            'folders' => $folders,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'direction' => $request->direction,
                'per_page' => $request->per_page ?? 10,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFolderRequest $request)
    {
        $folder = auth()->user()->folders()->create($request->validated());

        return redirect()->back()->with('success', 'Folder created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFolderRequest $request, Folder $folder)
    {
        $this->authorize('update', $folder);

        $folder->update($request->validated());

        return redirect()->back()->with('success', 'Folder updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Folder $folder)
    {
        $this->authorize('delete', $folder);

        $folder->delete();

        return redirect()->back()->with('success', 'Folder deleted successfully.');
    }

    /**
     * Bulk update folders (featured status).
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'folder_ids' => ['required', 'array', 'min:1'],
            'folder_ids.*' => ['integer', 'exists:folders,id'],
            'featured' => ['required', 'boolean'],
        ]);

        $folders = auth()->user()->folders()
            ->whereIn('id', $validated['folder_ids'])
            ->get();

        // Check authorization for each folder
        foreach ($folders as $folder) {
            $this->authorize('update', $folder);
        }

        // Update all folders
        auth()->user()->folders()
            ->whereIn('id', $validated['folder_ids'])
            ->update(['featured' => $validated['featured']]);

        $count = count($validated['folder_ids']);
        $action = $validated['featured'] ? 'added to featured' : 'removed from featured';

        return redirect()->back()->with('success', "{$count} folder" . ($count === 1 ? '' : 's') . " {$action}.");
    }

    /**
     * Bulk delete folders.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'folder_ids' => ['required', 'array', 'min:1'],
            'folder_ids.*' => ['integer', 'exists:folders,id'],
        ]);

        $folders = auth()->user()->folders()
            ->whereIn('id', $validated['folder_ids'])
            ->get();

        // Check authorization for each folder
        foreach ($folders as $folder) {
            $this->authorize('delete', $folder);
        }

        // Delete all folders
        auth()->user()->folders()
            ->whereIn('id', $validated['folder_ids'])
            ->delete();

        $count = count($validated['folder_ids']);

        return redirect()->back()->with('success', "{$count} folder" . ($count === 1 ? '' : 's') . " deleted successfully.");
    }
}
