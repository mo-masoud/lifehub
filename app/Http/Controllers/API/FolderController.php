<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Folders\StoreFolderRequest;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $folders = auth()->user()->folders()
            ->ordered()
            ->get();

        return response()->json($folders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFolderRequest $request)
    {
        $folder = auth()->user()->folders()->create($request->validated());

        return response()->json([
            'success' => 'Folder created successfully',
            'folder' => $folder,
        ], 201);
    }
}
