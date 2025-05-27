<?php

namespace App\Policies;

use App\Models\SavingsStorageLocation;
use App\Models\User;

class SavingsStorageLocationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SavingsStorageLocation $savingsStorageLocation): bool
    {
        return $savingsStorageLocation->user_id === null || $user->id === $savingsStorageLocation->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SavingsStorageLocation $savingsStorageLocation): bool
    {
        return $user->id === $savingsStorageLocation->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SavingsStorageLocation $savingsStorageLocation): bool
    {
        return $user->id === $savingsStorageLocation->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SavingsStorageLocation $savingsStorageLocation): bool
    {
        return $user->id === $savingsStorageLocation->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SavingsStorageLocation $savingsStorageLocation): bool
    {
        return $user->id === $savingsStorageLocation->user_id;
    }
}
