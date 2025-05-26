<?php

namespace App\Http\Controllers\API\Dashboard;

use App\Http\Controllers\Controller;
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
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return response()->json($folders);
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:folders,name,NULL,id,user_id,' . $user->id,
        ]);

        $folder = Folder::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
        ]);

        return response()->json($folder);
    }
}
