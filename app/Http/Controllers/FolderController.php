<?php

namespace App\Http\Controllers;

use App\Http\Requests\Folders\BulkDestroyFoldersRequest;
use App\Http\Requests\Folders\BulkUpdateFoldersRequest;
use App\Http\Requests\Folders\IndexFoldersRequest;
use App\Http\Requests\Folders\StoreFolderRequest;
use App\Http\Requests\Folders\UpdateFolderRequest;
use App\Models\Folder;
use App\Services\FolderService;
use Inertia\Inertia;

class FolderController extends Controller
{
    public function __construct(
        protected FolderService $folderService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(IndexFoldersRequest $request)
    {
        $filters = $request->getFilters();
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
    public function bulkUpdate(BulkUpdateFoldersRequest $request)
    {
        $folders = auth()->user()->folders()
            ->whereIn('id', $request->getFolderIds())
            ->get();

        // Check authorization for each folder
        foreach ($folders as $folder) {
            $this->authorize('update', $folder);
        }

        $this->folderService->bulkUpdateFolders(
            auth()->user(),
            $request->getFolderIds(),
            ['featured' => $request->getFeaturedStatus()]
        );

        return redirect()->back()->with('success', $request->getSuccessMessage());
    }

    /**
     * Bulk delete folders.
     */
    public function bulkDestroy(BulkDestroyFoldersRequest $request)
    {
        $folders = auth()->user()->folders()
            ->whereIn('id', $request->getFolderIds())
            ->get();

        // Check authorization for each folder
        foreach ($folders as $folder) {
            $this->authorize('delete', $folder);
        }

        $this->folderService->bulkDeleteFolders(auth()->user(), $request->getFolderIds());

        return redirect()->back()->with('success', $request->getSuccessMessage());
    }
}
