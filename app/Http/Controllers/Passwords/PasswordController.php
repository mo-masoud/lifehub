<?php

namespace App\Http\Controllers\Passwords;

use App\Http\Controllers\Controller;
use App\Http\Requests\Passwords\BulkDeletePasswordsRequest;
use App\Http\Requests\Passwords\BulkMoveToFolderRequest;
use App\Http\Requests\Passwords\BulkRemoveFromFolderRequest;
use App\Http\Requests\Passwords\IndexPasswordsRequest;
use App\Http\Requests\Passwords\StorePasswordRequest;
use App\Http\Requests\Passwords\UpdatePasswordRequest;
use App\Models\Password;
use App\Services\PasswordQueryService;
use App\Services\PasswordService;

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
            'expiryFilter' => $filters['expiry_filter'] ?? 'all',
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

    public function destroy(Password $password)
    {
        $this->authorize('delete', $password);

        $this->passwordService->delete($password);

        return redirect()->route('passwords.index')->with('success', 'Password deleted successfully.');
    }

    public function destroyBulk(BulkDeletePasswordsRequest $request)
    {
        $this->passwordService->destroyBulk($request->validated('ids'));

        return redirect()->route('passwords.index')->with('success', 'Passwords deleted successfully.');
    }

    public function moveToFolder(BulkMoveToFolderRequest $request)
    {
        $this->passwordService->moveToFolder(
            $request->validated('ids'),
            $request->validated('folder_id')
        );

        return redirect()->route('passwords.index')->with('success', 'Passwords moved to folder successfully.');
    }

    public function removeFromFolder(BulkRemoveFromFolderRequest $request)
    {
        $this->passwordService->removeFromFolder($request->validated('ids'));

        return redirect()->route('passwords.index')->with('success', 'Passwords removed from folder successfully.');
    }
}
