<?php

namespace App\Services;

use App\Models\Password;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PasswordService
{
    public function createPassword(User $user, array $data): Password
    {
        $data = $this->prepareData($data);

        return $user->passwords()->create($data);
    }

    public function updatePassword(Password $password, array $data): Password
    {
        $data = $this->prepareData($data);

        $password->update($data);

        return $password->fresh();
    }

    protected function prepareData(array $data): array
    {
        if ($data['type'] === 'ssh') {
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

    public function copy(Password $password)
    {
        $password->update(['last_used_at' => now(), 'copied' => $password->copied + 1]);

        return $password;
    }

    public function delete(Password $password)
    {
        $password->delete();
    }

    public function destroyBulk(array $ids)
    {
        $passwords = Password::whereIn('id', $ids)->where('user_id', auth()->id())->get();

        abort_if($passwords->isEmpty(), 403, 'You are not authorized to delete these passwords.');

        $passwords->each->delete();
    }
}
