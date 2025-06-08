<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Folders\StoreFolderRequest;
use App\Services\FolderService;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function __construct(
        protected FolderService $folderService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $folders = $this->folderService->getFolders(auth()->user());

        return api_response($folders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFolderRequest $request)
    {
        $folder = $this->folderService->createFolder(auth()->user(), $request->validated());

        return api_response(
            data: ['folder' => $folder],
            status: 201,
            message: 'Folder created successfully'
        );
    }
}
