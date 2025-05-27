<?php

namespace App\Policies;

use App\Models\Password;
use App\Models\PasswordHistory;
use App\Models\User;

class PasswordHistoryPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine whether the user can view any password histories.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the password history.
     * User can only view history for passwords they own.
     */
    public function view(User $user, PasswordHistory $passwordHistory): bool
    {
        return $user->id === $passwordHistory->password->user_id;
    }

    /**
     * Determine whether the user can view password history for a specific password.
     */
    public function viewForPassword(User $user, Password $password): bool
    {
        return $user->id === $password->user_id;
    }
}
