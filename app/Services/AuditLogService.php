<?php

namespace App\Services;

use App\Models\Password;
use App\Models\PasswordAuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogService
{
    /**
     * Log a password-related action.
     */
    public function logPasswordAction(
        Password $password,
        User $user,
        string $action,
        ?Request $request = null,
        ?array $metadata = null
    ): PasswordAuditLog {
        return PasswordAuditLog::create([
            'password_id' => $password->id,
            'user_id' => $user->id,
            'action' => $action,
            'ip_address' => $request?->ip(),
            'context' => $this->determineContext($request),
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }

    /**
     * Log a bulk password action.
     */
    public function logBulkPasswordAction(
        array $passwordIds,
        User $user,
        string $action,
        ?Request $request = null,
        ?array $metadata = null
    ): void {
        $timestamp = now();

        foreach ($passwordIds as $passwordId) {
            PasswordAuditLog::create([
                'password_id' => $passwordId,
                'user_id' => $user->id,
                'action' => $action,
                'ip_address' => $request?->ip(),
                'context' => $this->determineContext($request),
                'metadata' => $metadata,
                'created_at' => $timestamp,
            ]);
        }
    }

    /**
     * Determine the context from the request.
     */
    private function determineContext(?Request $request): string
    {
        if (! $request) {
            return 'system';
        }

        // Check for API requests
        if ($request->is('api/*')) {
            return 'api';
        }

        // Check for CLI context
        if (app()->runningInConsole()) {
            return 'cli';
        }

        return 'web';
    }
}
