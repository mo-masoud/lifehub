<?php

namespace App\Observers;

use App\Models\Password;
use App\Models\PasswordHistory;

class PasswordObserver
{
    /**
     * Handle the Password "created" event.
     */
    public function created(Password $password): void
    {
        //
    }

    /**
     * Handle the Password "updated" event.
     */
    public function updated(Password $password): void
    {
        //
    }

    /**
     * Handle the Password "deleted" event.
     */
    public function deleted(Password $password): void
    {
        //
    }

    /**
     * Handle the Password "restored" event.
     */
    public function restored(Password $password): void
    {
        //
    }

    /**
     * Handle the Password "force deleted" event.
     */
    public function forceDeleted(Password $password): void
    {
        //
    }

    /**
     * Handle the Password "updating" event.
     * This runs before the password is actually updated.
     */
    public function updating(Password $password): void
    {
        // Check if the password field is being changed
        if ($password->isDirty('password')) {
            // Get the original (old) password value
            $oldPassword = $password->getOriginal('password');

            // Only save to history if there was a previous password (not on first creation)
            if ($oldPassword !== null) {
                PasswordHistory::create([
                    'password_id' => $password->id,
                    'old_password' => $oldPassword,
                    'changed_at' => now(),
                ]);
            }
        }
    }
}
