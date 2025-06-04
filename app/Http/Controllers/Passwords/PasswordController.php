<?php

namespace App\Http\Controllers\Passwords;

use App\Http\Controllers\Controller;
use App\Http\Requests\Passwords\IndexPasswordsRequest;
use App\Services\PasswordQueryService;

class PasswordController extends Controller
{
    public function __construct(
        protected PasswordQueryService $passwordQueryService
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

        $folders = $this->getFolders();
        $webFilters = $this->getFilters($request, $filters);

        return inertia('passwords/index', [
            'passwords' => $passwords,
            'folders' => $folders,
            'filters' => $webFilters,
        ]);
    }

    protected function getFolders()
    {
        return auth()->user()->folders()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    protected function getFilters(IndexPasswordsRequest $request, array $filters): array
    {
        logs()->info('filters', [$filters]);
        return [
            'folderId' => $filters['folder_id'],
            'sort' => $filters['sort'],
            'direction' => $filters['direction'],
            'search' => $filters['search'],
            'perPage' => $request->per_page,
            'type' => $filters['type'],
        ];
    }
}
