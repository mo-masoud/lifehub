<?php

namespace App\Http\Controllers\Passwords;

use App\Http\Controllers\Controller;
use App\Http\Requests\Passwords\IndexPasswordsRequest;

class PasswordController extends Controller
{
    public function index(IndexPasswordsRequest $request)
    {
        $passwords = auth()->user()->passwords()
            ->with('folder')
            ->when($request->filled('folder_id'), function ($query) use ($request) {
                $query->where('folder_id', $request->folder_id);
            })
            ->when($request->filled('type'), function ($query) use ($request) {
                $query->where('type', $request->type);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                        ->orWhere('username', 'like', '%' . $request->search . '%')
                        ->orWhere('url', 'like', '%' . $request->search . '%')
                        ->orWhere('notes', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('expired'), function ($query) {
                $query->whereNotNull('expires_at')
                    ->where('expires_at', '<', now());
            })
            ->when($request->filled('expire_soon'), function ($query) {
                $query->expiresSoon();
            })
            ->when($request->filled('sort'), function ($query) use ($request) {
                $query->orderBy($request->sort ?? 'last_used_at', $request->direction ?? 'desc');
            }, function ($query) {
                $query->orderBy('last_used_at', 'desc');
            })
            ->paginate($request->per_page ?? 10);

        $folders = auth()->user()->folders()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $expirySoonCount = auth()->user()->passwords()
            ->expiresSoon()
            ->count();

        $expiredCount = auth()->user()->passwords()
            ->whereExpired()
            ->count();

        $filters = [
            'folderId' => $request->folder_id,
            'sort' => $request->sort,
            'direction' => $request->direction,
            'search' => $request->search,
            'perPage' => $request->per_page,
            'expired' => $request->expired,
            'type' => $request->type,
            'expireSoon' => $request->expire_soon,
        ];

        return inertia('passwords/index', [
            'passwords' => $passwords,
            'folders' => $folders,
            'expirySoonCount' => $expirySoonCount,
            'expiredCount' => $expiredCount,
            'filters' => $filters,
        ]);
    }
}
