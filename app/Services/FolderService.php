<?php

namespace App\Services;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FolderService
{
    /**
     * Create a new folder for a user.
     */
    public function createFolder(User $user, array $data): Folder
    {
        return $user->folders()->create($data);
    }

    /**
     * Update an existing folder.
     */
    public function updateFolder(Folder $folder, array $data): Folder
    {
        $folder->update($data);
        return $folder->fresh();
    }

    /**
     * Delete a folder.
     */
    public function deleteFolder(Folder $folder): bool
    {
        return $folder->delete();
    }

    /**
     * Bulk update folders (featured status).
     */
    public function bulkUpdateFolders(User $user, array $folderIds, array $data): int
    {
        // Get folders to verify ownership and authorization
        $folders = $user->folders()->whereIn('id', $folderIds)->get();

        if ($folders->count() !== count($folderIds)) {
            throw new \InvalidArgumentException('Some folders were not found or do not belong to the user.');
        }

        // Update all folders
        return $user->folders()
            ->whereIn('id', $folderIds)
            ->update($data);
    }

    /**
     * Bulk delete folders.
     */
    public function bulkDeleteFolders(User $user, array $folderIds): int
    {
        // Get folders to verify ownership and authorization
        $folders = $user->folders()->whereIn('id', $folderIds)->get();

        if ($folders->count() !== count($folderIds)) {
            throw new \InvalidArgumentException('Some folders were not found or do not belong to the user.');
        }

        // Delete all folders
        return $user->folders()
            ->whereIn('id', $folderIds)
            ->delete();
    }

    /**
     * Get folders with optional filtering and pagination.
     * If per_page is provided, returns paginated results.
     * If per_page is null or false, returns collection.
     */
    public function getFolders(User $user, array $filters = [])
    {
        $query = $this->buildFoldersQuery($user, $filters);

        // If per_page is specified and > 0, return paginated results
        if (isset($filters['per_page']) && $filters['per_page'] > 0) {
            return $query->paginate($filters['per_page']);
        }

        // Otherwise return collection
        return $query->get();
    }

    /**
     * Build the base query for folders with filters.
     */
    protected function buildFoldersQuery(User $user, array $filters = [])
    {
        $query = $user->folders();

        // Apply search filter
        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        // Apply featured filter
        if (isset($filters['featured']) && $filters['featured'] !== 'all') {
            if ($filters['featured'] === 'featured') {
                $query->where('featured', true);
            } elseif ($filters['featured'] === 'not_featured') {
                $query->where('featured', false);
            }
        }

        // Apply sorting
        if (!empty($filters['sort']) && !empty($filters['direction'])) {
            $sortField = $filters['sort'];
            $direction = $filters['direction'] === 'desc' ? 'desc' : 'asc';

            if (in_array($sortField, ['name', 'created_at', 'updated_at'])) {
                $query->orderBy($sortField, $direction);
            }
        }

        return $query->ordered();
    }
}
