<?php

namespace App\Policies;

use App\Models\InitialSaving;
use App\Models\User;

class InitialSavingPolicy
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
    public function delete(User $user, InitialSaving $initialSaving): bool
    {
        return $user->id === $initialSaving->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, InitialSaving $initialSaving): bool
    {
        return $user->id === $initialSaving->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, InitialSaving $initialSaving): bool
    {
        return $user->id === $initialSaving->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, InitialSaving $initialSaving): bool
    {
        return $user->id === $initialSaving->user_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, InitialSaving $initialSaving): bool
    {
        return $user->id === $initialSaving->user_id;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }
}
