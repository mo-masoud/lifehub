<?php

namespace App\Services;

use App\Models\Password;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PasswordQueryService
{
    public function getFilteredPasswords(
        $user,
        array $filters = [],
        bool $paginate = true,
        int $perPage = 10
    ): LengthAwarePaginator|Collection {
        $query = Password::query()
            ->with('folder')
            ->where('user_id', $user->id);

        $this->applyFilters($query, $filters);
        $this->applySorting($query, $filters);

        return $paginate
            ? $query->paginate($perPage)
            : $query->get();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        // Folder filter
        if (!empty($filters['folder_id']) && $filters['folder_id'] !== 'all') {
            $query->where('folder_id', $filters['folder_id'] === 'none' ? null : $filters['folder_id']);
        }

        // Type filter
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $searchTerm = '%' . $filters['search'] . '%';
                $q->where('name', 'like', $searchTerm)
                    ->orWhere('username', 'like', $searchTerm)
                    ->orWhere('url', 'like', $searchTerm)
                    ->orWhere('notes', 'like', $searchTerm);
            });
        }
    }

    protected function applySorting(Builder $query, array $filters): void
    {
        $sortField = $filters['sort'] ?? 'last_used_at';
        $sortDirection = $filters['direction'] ?? 'desc';

        $query->orderBy($sortField, $sortDirection);
    }

    public function getFilterArray(object $request): array
    {
        return [
            'folder_id' => $request->folder_id,
            'type' => $request->type,
            'search' => $request->search,
            'sort' => $request->sort,
            'direction' => $request->direction,
        ];
    }
}
