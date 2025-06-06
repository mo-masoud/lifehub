<?php

namespace App\Http\Controllers\Passwords;

use App\Http\Controllers\Controller;
use App\Http\Requests\Passwords\IndexPasswordsRequest;
use App\Http\Requests\Passwords\StorePasswordRequest;
use App\Http\Requests\Passwords\UpdatePasswordRequest;
use App\Services\PasswordService;
use App\Services\PasswordQueryService;
use App\Models\Password;

class PasswordController extends Controller
{
    public function __construct(
        protected PasswordQueryService $passwordQueryService,
        protected PasswordService $passwordService
    ) {}

    public function index(IndexPasswordsRequest $request)
    {
        $filters = $this->passwordQueryService->getFilterArray($request);
        $perPage = $request->per_page ?? 10;

        $passwords = $this->passwordQueryService->getFilteredPasswords(
            auth()->user(),
            $filters,
            paginate: true,
            perPage: $perPage
        );

        $webFilters = [
            'folderId' => $filters['folder_id'],
            'sort' => $filters['sort'],
            'direction' => $filters['direction'],
            'search' => $filters['search'],
            'perPage' => $request->per_page,
            'type' => $filters['type'],
        ];

        return inertia('passwords/index', [
            'passwords' => $passwords,
            'filters' => $webFilters,
        ]);
    }

    public function store(StorePasswordRequest $request)
    {
        $this->passwordService->createPassword(
            auth()->user(),
            $request->validated()
        );

        return redirect()->route('passwords.index')->with('success', 'Password created successfully.');
    }

    public function update(UpdatePasswordRequest $request, Password $password)
    {
        $this->passwordService->updatePassword(
            $password,
            $request->validated()
        );

        return redirect()->route('passwords.index')->with('success', 'Password updated successfully.');
    }

    public function copy(Password $password)
    {
        $this->authorize('view', $password);

        $password = $this->passwordService->copy($password);

        return response()->json(['message' => 'Password copied to clipboard.', 'password' => $password]);
    }
}
