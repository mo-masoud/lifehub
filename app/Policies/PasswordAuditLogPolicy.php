<?php

namespace App\Policies;

use App\Models\PasswordAuditLog;
use App\Models\User;

class PasswordAuditLogPolicy
{
    /**
     * Determine whether the user can view any audit logs.
     */
    public function viewAny(User $user): bool
    {
        // Users can view audit logs for their own passwords
        return true;
    }

    /**
     * Determine whether the user can view the audit log.
     */
    public function view(User $user, PasswordAuditLog $auditLog): bool
    {
        // Users can only view audit logs for passwords they own
        return $auditLog->password && $auditLog->password->user_id === $user->id;
    }
}
