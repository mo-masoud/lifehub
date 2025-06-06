<?php

namespace App\Http\Controllers;

use App\Http\Requests\Folders\StoreFolderRequest;
use App\Models\Folder;

class FolderController extends Controller
{
    public function index()
    {
        $folders = auth()->user()->folders()
            ->latest()
            ->get();

        return response()->json($folders);
    }

    public function store(StoreFolderRequest $request)
    {
        $folder = auth()->user()->folders()->create($request->validated());

        return response()->json([
            'success' => 'Folder created successfully',
            'folder' => $folder,
        ], 201);
    }
}
