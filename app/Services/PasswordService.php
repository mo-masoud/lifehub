<?php

namespace App\Services;

use App\Models\Password;
use App\Models\User;
use App\Services\EnvelopeEncryptionService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Mockery\Generator\StringManipulation\Pass\Pass;

class PasswordService
{
    public function __construct(
        private EnvelopeEncryptionService $encryptionService,
        private AuditLogService $auditLogService
    ) {}

    public function createPassword(User $user, array $data): Password
    {
        $data = $this->prepareData($data);
        $data['user_id'] = $user->id;

        // Handle password encryption if provided
        if (isset($data['password'])) {
            $data = $this->encryptPassword($data);
        }

        $password = Password::create($data);

        // Log the creation
        $this->auditLogService->logPasswordAction(
            $password,
            $user,
            'created',
            request()
        );

        return $password;
    }

    public function updatePassword(Password $password, array $data): Password
    {
        $data = $this->prepareData($data);

        // Handle password encryption if provided
        if (isset($data['password'])) {
            $data = $this->encryptPassword($data);
        }

        $password->update($data);

        // Log the update
        $this->auditLogService->logPasswordAction(
            $password,
            $password->user,
            'updated',
            request()
        );

        return $password->fresh();
    }

    protected function prepareData(array $data): array
    {
        if (isset($data['type']) && $data['type'] === 'ssh') {
            if (isset($data['cli'])) {
                $data['username'] = $this->extractUsernameFromCli($data['cli']);
                $data['url'] = $this->extractUrlFromCli($data['cli']);
            } else {
                $errors = [];
                if (!isset($data['username'])) {
                    $errors['username'] = 'Username is required for SSH passwords if you don\'t use the CLI command.';
                }

                if (!isset($data['url'])) {
                    $errors['url'] = 'URL is required for SSH passwords if you don\'t use the CLI command.';
                }

                if ($errors) {
                    throw ValidationException::withMessages($errors);
                }
            }
        }

        $data['last_used_at'] = now();
        return $data;
    }

    protected function extractUsernameFromCli(string $cli): string
    {
        return str($cli)->before('@')->replace('ssh', '')->trim();
    }

    protected function extractUrlFromCli(string $cli): string
    {
        return str($cli)->after('@')->trim();
    }

    protected function encryptPassword(array $data): array
    {
        if (empty($data['password'])) {
            return $data;
        }

        $encrypted = $this->encryptionService->encrypt($data['password']);

        $data['password'] = $encrypted['encrypted_data'];
        $data['encrypted_key'] = $encrypted['encrypted_key'];
        $data['key_version'] = $encrypted['key_version'];

        return $data;
    }

    public function copy(Password $password)
    {
        $password->update(['last_used_at' => now(), 'copied' => $password->copied + 1]);

        // Log the copy action
        $this->auditLogService->logPasswordAction(
            $password,
            $password->user,
            'copied',
            request()
        );

        return $password;
    }

    public function delete(Password $password)
    {
        // Log the deletion before deleting
        $this->auditLogService->logPasswordAction(
            $password,
            $password->user,
            'deleted',
            request()
        );

        $password->delete();
    }

    public function destroyBulk(array $ids)
    {
        $passwords = Password::whereIn('id', $ids)->where('user_id', auth()->id())->get();

        abort_if($passwords->isEmpty(), 403, 'You are not authorized to delete these passwords.');

        // Log bulk deletion before deleting passwords
        $this->auditLogService->logBulkPasswordAction(
            $ids,
            $passwords->first()->user,
            'bulk_deleted',
            request()
        );

        $passwords->each->delete();
    }

    public function moveToFolder(array $ids, ?int $folderId)
    {
        $passwords = Password::whereIn('id', $ids)->where('user_id', auth()->id())->get();

        abort_if($passwords->isEmpty(), 403, 'You are not authorized to move these passwords.');

        $passwords->each(function (Password $password) use ($folderId) {
            $password->update(['folder_id' => $folderId]);
        });

        // Log bulk move to folder
        $this->auditLogService->logBulkPasswordAction(
            $ids,
            $passwords->first()->user,
            'moved_to_folder',
            request(),
            ['folder_id' => $folderId]
        );
    }

    public function removeFromFolder(array $ids)
    {
        $passwords = Password::whereIn('id', $ids)->where('user_id', auth()->id())->get();

        abort_if($passwords->isEmpty(), 403, 'You are not authorized to remove these passwords from folder.');

        $passwords->each(function (Password $password) {
            $password->update(['folder_id' => null]);
        });

        // Log bulk remove from folder
        $this->auditLogService->logBulkPasswordAction(
            $ids,
            $passwords->first()->user,
            'removed_from_folder',
            request()
        );
    }
}
