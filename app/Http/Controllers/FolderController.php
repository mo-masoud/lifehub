<?php

namespace App\Http\Controllers;

use App\Http\Requests\Folders\StoreFolderRequest;
use App\Http\Requests\Folders\UpdateFolderRequest;
use App\Models\Folder;
use App\Services\FolderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FolderController extends Controller
{
    public function __construct(
        protected FolderService $folderService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = [
            'search' => $request->search,
            'sort' => $request->sort,
            'direction' => $request->direction,
            'per_page' => $request->per_page ?? 10,
            'featured' => $request->featured,
        ];

        $folders = $this->folderService->getFolders(auth()->user(), $filters);

        return Inertia::render('folders/index', [
            'folders' => $folders,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFolderRequest $request)
    {
        $this->folderService->createFolder(auth()->user(), $request->validated());

        return redirect()->back()->with('success', 'Folder created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFolderRequest $request, Folder $folder)
    {
        $this->authorize('update', $folder);

        $this->folderService->updateFolder($folder, $request->validated());

        return redirect()->back()->with('success', 'Folder updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Folder $folder)
    {
        $this->authorize('delete', $folder);

        $this->folderService->deleteFolder($folder);

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

        $this->folderService->bulkUpdateFolders(
            auth()->user(),
            $validated['folder_ids'],
            ['featured' => $validated['featured']]
        );

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

        $this->folderService->bulkDeleteFolders(auth()->user(), $validated['folder_ids']);

        $count = count($validated['folder_ids']);

        return redirect()->back()->with('success', "{$count} folder" . ($count === 1 ? '' : 's') . " deleted successfully.");
    }
}
