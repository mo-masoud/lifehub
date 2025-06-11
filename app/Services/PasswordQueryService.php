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

    /**
     * Get recently used passwords for dashboard
     */
    public function getRecentlyUsedPasswords($user, int $limit = 5): Collection
    {
        return $user->passwords()
            ->with('folder')
            ->whereNotNull('last_used_at')
            ->orderBy('last_used_at', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Get recently expired passwords for dashboard
     */
    public function getRecentlyExpiredPasswords($user, int $limit = 5): Collection
    {
        return $user->passwords()
            ->with('folder')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->where('expires_at', '>=', now()->subDays(30)) // Only show passwords expired in last 30 days
            ->orderBy('expires_at', 'desc') // Most recently expired first
            ->take($limit)
            ->get();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        // Folder filter
        if (! empty($filters['folder_id']) && $filters['folder_id'] !== 'all') {
            $query->where('folder_id', $filters['folder_id'] === 'none' ? null : $filters['folder_id']);
        }

        // Type filter
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Expiry filter
        if (! empty($filters['expiry_filter'])) {
            $query->filterByExpiry($filters['expiry_filter']);
        }

        // Search filter
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $searchTerm = '%'.$filters['search'].'%';
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
            'expiry_filter' => $request->expiry_filter,
        ];
    }
}
