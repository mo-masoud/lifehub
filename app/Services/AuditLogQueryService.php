<?php

namespace App\Services;

use App\Http\Requests\AuditLog\IndexAuditLogRequest;
use App\Models\PasswordAuditLog;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class AuditLogQueryService
{
    /**
     * Get filtered audit logs for a user.
     */
    public function getFilteredAuditLogs(
        User $user,
        array $filters,
        bool $paginate = true,
        ?int $perPage = null
    ): LengthAwarePaginator|Collection {
        $query = PasswordAuditLog::query()
            ->forPasswordsOwnedBy($user)
            ->with(['password:id,name,folder_id', 'password.folder:id,name'])
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc');

        $this->applyFilters($query, $filters);

        if ($paginate) {
            return $query->paginate($perPage ?? $filters['per_page'] ?? 10);
        }

        return $query->get();
    }

    /**
     * Apply filters to the query.
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        // Filter by specific password
        if (!empty($filters['password_id'])) {
            $query->forPassword($filters['password_id']);
        }

        // Filter by action
        if (!empty($filters['action'])) {
            $query->withAction($filters['action']);
        }

        // Filter by date range
        if (!empty($filters['start_date']) || !empty($filters['end_date'])) {
            $query->inDateRange($filters['start_date'] ?? null, $filters['end_date'] ?? null);
        }

        // Search functionality
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('action', 'like', $searchTerm)
                    ->orWhere('ip_address', 'like', $searchTerm)
                    ->orWhere('context', 'like', $searchTerm)
                    ->orWhereHas('password', function (Builder $passwordQuery) use ($searchTerm) {
                        $passwordQuery->where('name', 'like', $searchTerm);
                    });
            });
        }
    }

    /**
     * Get filter array from request.
     */
    public function getFilterArray(IndexAuditLogRequest $request): array
    {
        return $request->getValidatedFilters();
    }

    /**
     * Get available actions for filtering.
     */
    public function getAvailableActions(): array
    {
        return [
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'copied' => 'Copied',
            'viewed' => 'Viewed',
            'bulk_deleted' => 'Bulk Deleted',
            'moved_to_folder' => 'Moved to Folder',
            'removed_from_folder' => 'Removed from Folder',
        ];
    }

    /**
     * Get user's passwords for filtering dropdown.
     */
    public function getUserPasswordsForFilter(User $user): array
    {
        return $user->passwords()
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(function ($password) {
                return [
                    'id' => $password->id,
                    'name' => $password->name,
                ];
            })
            ->toArray();
    }
}
