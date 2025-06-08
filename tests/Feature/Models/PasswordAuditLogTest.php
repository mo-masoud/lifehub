<?php

use App\Models\Password;
use App\Models\PasswordAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->password = Password::factory()->create(['user_id' => $this->user->id]);
});

describe('PasswordAuditLog Model', function () {
    test('can create an audit log entry', function () {
        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'action' => 'created',
            'ip_address' => '192.168.1.1',
            'context' => 'web',
            'metadata' => ['test' => 'data'],
        ]);

        expect($auditLog)->toBeInstanceOf(PasswordAuditLog::class)
            ->and($auditLog->password_id)->toBe($this->password->id)
            ->and($auditLog->user_id)->toBe($this->user->id)
            ->and($auditLog->action)->toBe('created')
            ->and($auditLog->ip_address)->toBe('192.168.1.1')
            ->and($auditLog->context)->toBe('web')
            ->and($auditLog->metadata)->toBe(['test' => 'data']);
    });

    test('has correct fillable attributes', function () {
        $auditLog = new PasswordAuditLog;

        expect($auditLog->getFillable())->toBe([
            'password_id',
            'user_id',
            'action',
            'ip_address',
            'context',
            'metadata',
            'created_at',
        ]);
    });

    test('has correct casts', function () {
        $auditLog = new PasswordAuditLog;
        $casts = $auditLog->getCasts();

        expect($casts)->toHaveKey('metadata', 'array')
            ->and($casts)->toHaveKey('created_at', 'datetime');
    });

    test('has correct appended attributes', function () {
        $auditLog = new PasswordAuditLog;

        expect($auditLog->getAppends())->toBe([
            'action_display',
            'masked_password_name',
            'created_at_formatted',
        ]);
    });

    test('has timestamps disabled', function () {
        $auditLog = new PasswordAuditLog;

        expect($auditLog->timestamps)->toBeFalse();
    });

    test('belongs to password', function () {
        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
        ]);

        expect($auditLog->password)->toBeInstanceOf(Password::class)
            ->and($auditLog->password->id)->toBe($this->password->id);
    });

    test('belongs to user', function () {
        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
        ]);

        expect($auditLog->user)->toBeInstanceOf(User::class)
            ->and($auditLog->user->id)->toBe($this->user->id);
    });

    test('forPasswordsOwnedBy scope filters by user owned passwords', function () {
        $otherUser = User::factory()->create();
        $otherPassword = Password::factory()->create(['user_id' => $otherUser->id]);

        $userLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
        ]);

        $otherUserLog = PasswordAuditLog::factory()->create([
            'password_id' => $otherPassword->id,
            'user_id' => $otherUser->id,
        ]);

        $results = PasswordAuditLog::forPasswordsOwnedBy($this->user)->get();

        expect($results->pluck('id')->toArray())
            ->toContain($userLog->id)
            ->not->toContain($otherUserLog->id);
    });

    test('withAction scope filters by action', function () {
        $createdLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'action' => 'created',
        ]);

        $copiedLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'action' => 'copied',
        ]);

        $results = PasswordAuditLog::withAction('created')->get();

        expect($results->pluck('id')->toArray())
            ->toContain($createdLog->id)
            ->not->toContain($copiedLog->id);
    });

    test('forPassword scope filters by password id', function () {
        $otherPassword = Password::factory()->create(['user_id' => $this->user->id]);

        $log1 = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
        ]);

        $log2 = PasswordAuditLog::factory()->create([
            'password_id' => $otherPassword->id,
            'user_id' => $this->user->id,
        ]);

        $results = PasswordAuditLog::forPassword($this->password->id)->get();

        expect($results->pluck('id')->toArray())
            ->toContain($log1->id)
            ->not->toContain($log2->id);
    });

    test('inDateRange scope filters by start date only', function () {
        $oldLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDays(10),
        ]);

        $recentLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDay(),
        ]);

        $results = PasswordAuditLog::inDateRange(now()->subDays(3)->format('Y-m-d'), null)->get();

        expect($results->pluck('id')->toArray())
            ->not->toContain($oldLog->id)
            ->toContain($recentLog->id);
    });

    test('inDateRange scope filters by end date only', function () {
        $oldLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDays(10),
        ]);

        $futureLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->addDay(),
        ]);

        $results = PasswordAuditLog::inDateRange(null, now()->subDays(3)->format('Y-m-d'))->get();

        expect($results->pluck('id')->toArray())
            ->toContain($oldLog->id)
            ->not->toContain($futureLog->id);
    });

    test('inDateRange scope filters by both start and end date', function () {
        $beforeLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDays(10),
        ]);

        $withinLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->subDay(),
        ]);

        $afterLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->addDay(),
        ]);

        $results = PasswordAuditLog::inDateRange(
            now()->subDays(3)->format('Y-m-d'),
            now()->format('Y-m-d')
        )->get();

        expect($results->pluck('id')->toArray())
            ->not->toContain($beforeLog->id)
            ->toContain($withinLog->id)
            ->not->toContain($afterLog->id);
    });

    test('inDateRange scope handles null dates gracefully', function () {
        $log = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
        ]);

        $results = PasswordAuditLog::inDateRange(null, null)->get();

        expect($results->pluck('id')->toArray())->toContain($log->id);
    });

    test('createdAtFormatted accessor formats date correctly', function () {
        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => now()->setDate(2024, 1, 15)->setTime(14, 30, 0),
        ]);

        expect($auditLog->created_at_formatted)->toBe('Jan 15, 2024 2:30 PM');
    });

    test('createdAtFormatted accessor handles null date', function () {
        $auditLog = new PasswordAuditLog([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => null,
        ]);

        expect($auditLog->created_at_formatted)->toBeNull();
    });

    test('actionDisplay accessor returns correct display names', function () {
        $actions = [
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'copied' => 'Copied',
            'viewed' => 'Viewed',
            'bulk_deleted' => 'Bulk Deleted',
            'moved_to_folder' => 'Moved to Folder',
            'removed_from_folder' => 'Removed from Folder',
        ];

        foreach ($actions as $action => $expectedDisplay) {
            $auditLog = PasswordAuditLog::factory()->create([
                'password_id' => $this->password->id,
                'user_id' => $this->user->id,
                'action' => $action,
            ]);

            expect($auditLog->action_display)->toBe($expectedDisplay);
        }
    });

    test('actionDisplay accessor handles unknown action', function () {
        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'action' => 'custom_action',
        ]);

        expect($auditLog->action_display)->toBe('Custom_action');
    });

    test('maskedPasswordName accessor masks long password names', function () {
        $longName = 'This is a very long password name that should be masked';
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => $longName,
        ]);

        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        expect($auditLog->masked_password_name)->toBe('This is ****e masked');
    });

    test('maskedPasswordName accessor masks medium length password names', function () {
        $mediumName = 'Medium Name';
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => $mediumName,
        ]);

        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        expect($auditLog->masked_password_name)->toBe('Med***ame');
    });

    test('maskedPasswordName accessor does not mask short password names', function () {
        $shortName = 'Short';
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => $shortName,
        ]);

        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        expect($auditLog->masked_password_name)->toBe('Short');
    });

    test('maskedPasswordName accessor handles deleted password', function () {
        // Create an audit log directly without a password relationship
        $auditLog = new PasswordAuditLog([
            'password_id' => 999999, // Non-existent password ID
            'user_id' => $this->user->id,
            'action' => 'deleted',
            'context' => 'web',
            'created_at' => now(),
        ]);

        expect($auditLog->masked_password_name)->toBe('Unk***own');
    });

    test('metadata is properly cast to array', function () {
        $metadata = ['key' => 'value', 'nested' => ['data' => 'test']];

        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'metadata' => $metadata,
        ]);

        $auditLog->refresh();

        expect($auditLog->metadata)->toBe($metadata)
            ->and($auditLog->metadata['key'])->toBe('value')
            ->and($auditLog->metadata['nested']['data'])->toBe('test');
    });

    test('metadata can be null', function () {
        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'metadata' => null,
        ]);

        expect($auditLog->metadata)->toBeNull();
    });

    test('can combine multiple scopes', function () {
        $targetLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'action' => 'created',
            'created_at' => now()->subDay(),
        ]);

        $otherActionLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'action' => 'deleted',
            'created_at' => now()->subDay(),
        ]);

        $oldLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'action' => 'created',
            'created_at' => now()->subDays(10),
        ]);

        $results = PasswordAuditLog::forPasswordsOwnedBy($this->user)
            ->withAction('created')
            ->forPassword($this->password->id)
            ->inDateRange(now()->subDays(3)->format('Y-m-d'), now()->format('Y-m-d'))
            ->get();

        expect($results->pluck('id')->toArray())
            ->toContain($targetLog->id)
            ->not->toContain($otherActionLog->id)
            ->not->toContain($oldLog->id);
    });

    test('created_at is properly cast to datetime', function () {
        $timestamp = now();

        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $this->password->id,
            'user_id' => $this->user->id,
            'created_at' => $timestamp,
        ]);

        expect($auditLog->created_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class)
            ->and($auditLog->created_at->format('Y-m-d H:i:s'))->toBe($timestamp->format('Y-m-d H:i:s'));
    });

    test('relationships work with eager loading', function () {
        $folder = \App\Models\Folder::factory()->create(['user_id' => $this->user->id]);
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'folder_id' => $folder->id,
        ]);

        $auditLog = PasswordAuditLog::factory()->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $loadedLog = PasswordAuditLog::with(['password.folder', 'user'])
            ->find($auditLog->id);

        expect($loadedLog->password)->not->toBeNull()
            ->and($loadedLog->password->folder)->not->toBeNull()
            ->and($loadedLog->password->folder->id)->toBe($folder->id)
            ->and($loadedLog->user)->not->toBeNull()
            ->and($loadedLog->user->id)->toBe($this->user->id);
    });
});
