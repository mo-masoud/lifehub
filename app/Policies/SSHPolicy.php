<?php

namespace App\Policies;

use App\Models\SSH;
use App\Models\User;

class SSHPolicy
{
    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SSH $ssh): bool
    {
        return $user->id === $ssh->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SSH $ssh): bool
    {
        return $user->id === $ssh->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SSH $ssh): bool
    {
        return $user->id === $ssh->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SSH $ssh): bool
    {
        return $user->id === $ssh->user_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SSH $ssh): bool
    {
        return $user->id === $ssh->user_id;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }
}
