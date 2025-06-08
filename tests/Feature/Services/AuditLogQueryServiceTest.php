<?php

use App\Models\Password;
use App\Models\PasswordAuditLog;
use App\Models\User;
use App\Services\AuditLogQueryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
    $this->service = new AuditLogQueryService;
});

describe('AuditLogQueryService', function () {
    test('getFilteredAuditLogs returns only logs for user owned passwords', function () {
        $userPassword = Password::factory()->create(['user_id' => $this->user->id]);
        $otherUserPassword = Password::factory()->create(['user_id' => $this->otherUser->id]);

        $userLog = PasswordAuditLog::factory()->create([
            'password_id' => $userPassword->id,
            'user_id' => $this->user->id,
        ]);

        $otherUserLog = PasswordAuditLog::factory()->create([
            'password_id' => $otherUserPassword->id,
            'user_id' => $this->otherUser->id,
        ]);

        $results = $this->service->getFilteredAuditLogs($this->user, [], false);

        expect($results->pluck('id')->toArray())
            ->toContain($userLog->id)
            ->not->toContain($otherUserLog->id);
    });

    test('getFilteredAuditLogs includes password and folder relationships', function () {
        $folder = \App\Models\Folder::factory()->create(['user_id' => $this->user->id]);
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'folder_id' => $folder->id,
        ]);

        PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $results = $this->service->getFilteredAuditLogs($this->user, [], false);

        expect($results->first()->password)->not->toBeNull()
            ->and($results->first()->password->folder)->not->toBeNull()
            ->and($results->first()->password->folder->id)->toBe($folder->id);
    });

    test('getFilteredAuditLogs filters by password_id', function () {
        $password1 = Password::factory()->create(['user_id' => $this->user->id]);
        $password2 = Password::factory()->create(['user_id' => $this->user->id]);

        $log1 = PasswordAuditLog::factory()->create([
            'password_id' => $password1->id,
            'user_id' => $this->user->id,
        ]);

        $log2 = PasswordAuditLog::factory()->create([
            'password_id' => $password2->id,
            'user_id' => $this->user->id,
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['password_id' => $password1->id],
            false
        );

        expect($results->pluck('id')->toArray())
            ->toContain($log1->id)
            ->not->toContain($log2->id);
    });

    test('getFilteredAuditLogs filters by action', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $createdLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'action' => 'created',
        ]);

        $copiedLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'action' => 'copied',
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['action' => 'created'],
            false
        );

        expect($results->pluck('id')->toArray())
            ->toContain($createdLog->id)
            ->not->toContain($copiedLog->id);
    });

    test('getFilteredAuditLogs filters by date range', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $oldLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDays(10),
        ]);

        $recentLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDay(),
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            [
                'start_date' => now()->subDays(3)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ],
            false
        );

        expect($results->pluck('id')->toArray())
            ->not->toContain($oldLog->id)
            ->toContain($recentLog->id);
    });

    test('getFilteredAuditLogs filters by start date only', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $oldLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDays(10),
        ]);

        $recentLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDay(),
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['start_date' => now()->subDays(3)->format('Y-m-d')],
            false
        );

        expect($results->pluck('id')->toArray())
            ->not->toContain($oldLog->id)
            ->toContain($recentLog->id);
    });

    test('getFilteredAuditLogs filters by end date only', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $oldLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDays(10),
        ]);

        $futureLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->addDay(),
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['end_date' => now()->subDays(3)->format('Y-m-d')],
            false
        );

        expect($results->pluck('id')->toArray())
            ->toContain($oldLog->id)
            ->not->toContain($futureLog->id);
    });

    test('getFilteredAuditLogs searches by action', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $createdLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'action' => 'created',
        ]);

        $deletedLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'action' => 'deleted',
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['search' => 'creat'],
            false
        );

        expect($results->pluck('id')->toArray())
            ->toContain($createdLog->id)
            ->not->toContain($deletedLog->id);
    });

    test('getFilteredAuditLogs searches by IP address', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $log1 = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
        ]);

        $log2 = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'ip_address' => '10.0.0.1',
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['search' => '192.168'],
            false
        );

        expect($results->pluck('id')->toArray())
            ->toContain($log1->id)
            ->not->toContain($log2->id);
    });

    test('getFilteredAuditLogs searches by context', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $webLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'context' => 'web',
        ]);

        $apiLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'context' => 'api',
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['search' => 'api'],
            false
        );

        expect($results->pluck('id')->toArray())
            ->not->toContain($webLog->id)
            ->toContain($apiLog->id);
    });

    test('getFilteredAuditLogs searches by password name', function () {
        $password1 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Gmail Account',
        ]);

        $password2 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'GitHub Access',
        ]);

        $log1 = PasswordAuditLog::factory()->create([
            'password_id' => $password1->id,
            'user_id' => $this->user->id,
        ]);

        $log2 = PasswordAuditLog::factory()->create([
            'password_id' => $password2->id,
            'user_id' => $this->user->id,
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['search' => 'Gmail'],
            false
        );

        expect($results->pluck('id')->toArray())
            ->toContain($log1->id)
            ->not->toContain($log2->id);
    });

    test('getFilteredAuditLogs paginates results when requested', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);
        PasswordAuditLog::factory()->count(25)->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            [],
            true,
            10
        );

        expect($results)->toBeInstanceOf(\Illuminate\Contracts\Pagination\LengthAwarePaginator::class)
            ->and($results->items())->toHaveCount(10)
            ->and($results->total())->toBe(25);
    });

    test('getFilteredAuditLogs returns collection when pagination disabled', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);
        PasswordAuditLog::factory()->count(5)->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            [],
            false
        );

        expect($results)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class)
            ->and($results)->toHaveCount(5);
    });

    test('getFilteredAuditLogs sorts by created_at desc by default', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $oldLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subHour(),
        ]);

        $newLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'created_at' => now(),
        ]);

        $results = $this->service->getFilteredAuditLogs($this->user, [], false);

        expect($results->first()->id)->toBe($newLog->id)
            ->and($results->last()->id)->toBe($oldLog->id);
    });

    test('getFilteredAuditLogs sorts by action when specified', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);

        $createdLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'action' => 'created',
        ]);

        $deletedLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
            'action' => 'deleted',
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            ['sort' => 'action', 'direction' => 'asc'],
            false
        );

        expect($results->first()->id)->toBe($createdLog->id)
            ->and($results->last()->id)->toBe($deletedLog->id);
    });

    test('getFilteredAuditLogs combines multiple filters', function () {
        $password1 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Gmail Account',
        ]);

        $password2 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'GitHub Access',
        ]);

        $targetLog = PasswordAuditLog::factory()->create([
            'password_id' => $password1->id,
            'user_id' => $this->user->id,
            'action' => 'created',
            'created_at' => now()->subDay(),
        ]);

        $otherLog = PasswordAuditLog::factory()->create([
            'password_id' => $password2->id,
            'user_id' => $this->user->id,
            'action' => 'deleted',
            'created_at' => now()->subDays(10),
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            [
                'password_id' => $password1->id,
                'action' => 'created',
                'start_date' => now()->subDays(3)->format('Y-m-d'),
                'search' => 'create',
            ],
            false
        );

        expect($results->pluck('id')->toArray())
            ->toContain($targetLog->id)
            ->not->toContain($otherLog->id);
    });

    test('getAvailableActions returns correct action mapping', function () {
        $actions = $this->service->getAvailableActions();

        expect($actions)->toBe([
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'copied' => 'Copied',
            'viewed' => 'Viewed',
            'bulk_deleted' => 'Bulk Deleted',
            'moved_to_folder' => 'Moved to Folder',
            'removed_from_folder' => 'Removed from Folder',
        ]);
    });

    test('getUserPasswordsForFilter returns user passwords sorted by name', function () {
        Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Zebra Password',
        ]);

        Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Alpha Password',
        ]);

        Password::factory()->create([
            'user_id' => $this->otherUser->id,
            'name' => 'Other User Password',
        ]);

        $passwords = $this->service->getUserPasswordsForFilter($this->user);

        expect($passwords)->toHaveCount(2)
            ->and($passwords[0]['name'])->toBe('Alpha Password')
            ->and($passwords[1]['name'])->toBe('Zebra Password');
    });

    test('getUserPasswordsForFilter returns only id and name fields', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Password',
        ]);

        $passwords = $this->service->getUserPasswordsForFilter($this->user);

        expect($passwords[0])->toHaveKeys(['id', 'name'])
            ->and($passwords[0]['id'])->toBe($password->id)
            ->and($passwords[0]['name'])->toBe('Test Password');
    });

    test('getFilteredAuditLogs handles empty filters gracefully', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);
        PasswordAuditLog::factory()->count(3)->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $results = $this->service->getFilteredAuditLogs($this->user, [], false);

        expect($results)->toHaveCount(3);
    });

    test('getFilteredAuditLogs handles null filter values', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);
        PasswordAuditLog::factory()->count(2)->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $results = $this->service->getFilteredAuditLogs(
            $this->user,
            [
                'password_id' => null,
                'action' => null,
                'start_date' => null,
                'end_date' => null,
                'search' => null,
            ],
            false
        );

        expect($results)->toHaveCount(2);
    });
});
