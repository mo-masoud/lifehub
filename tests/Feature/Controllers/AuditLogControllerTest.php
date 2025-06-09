<?php

use App\Models\Password;
use App\Models\PasswordAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

describe('AuditLogController', function () {
    test('index requires authentication', function () {
        $response = $this->get(route('passwords.audit-logs.index'));

        $response->assertRedirect(route('login'));
    });

    test('index returns audit logs page with data', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);
        PasswordAuditLog::factory()->count(5)->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->get(route('passwords.audit-logs.index'));

        $response->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('audit-logs/index')
                    ->has('auditLogs.data', 5)
                    ->has('filters')
                    ->has('availableActions')
                    ->has('userPasswords')
            );
    });

    test('index only shows audit logs for user owned passwords', function () {
        $userPassword = Password::factory()->create(['user_id' => $this->user->id]);
        $otherUserPassword = Password::factory()->create(['user_id' => $this->otherUser->id]);

        $userAuditLog = PasswordAuditLog::factory()->create([
            'password_id' => $userPassword->id,
            'user_id' => $this->user->id,
        ]);

        $otherUserAuditLog = PasswordAuditLog::factory()->create([
            'password_id' => $otherUserPassword->id,
            'user_id' => $this->otherUser->id,
        ]);

        $this->actingAs($this->user)->get(route('passwords.audit-logs.index'))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('auditLogs.data', function ($auditLogs) use ($userAuditLog, $otherUserAuditLog) {
                    $auditLogIds = collect($auditLogs)->pluck('id')->toArray();
                    return in_array($userAuditLog->id, $auditLogIds) &&
                        !in_array($otherUserAuditLog->id, $auditLogIds);
                }));
    });

    test('index filters by password id', function () {
        $password1 = Password::factory()->create(['user_id' => $this->user->id]);
        $password2 = Password::factory()->create(['user_id' => $this->user->id]);

        $auditLog1 = PasswordAuditLog::factory()->create([
            'password_id' => $password1->id,
            'user_id' => $this->user->id,
        ]);

        $auditLog2 = PasswordAuditLog::factory()->create([
            'password_id' => $password2->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['password_id' => $password1->id]))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('auditLogs.data', function ($auditLogs) use ($auditLog1, $auditLog2) {
                    $auditLogIds = collect($auditLogs)->pluck('id')->toArray();
                    return in_array($auditLog1->id, $auditLogIds) &&
                        !in_array($auditLog2->id, $auditLogIds);
                }));
    });

    test('index filters by action', function () {
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

        $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['action' => 'created']))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('auditLogs.data', function ($auditLogs) use ($createdLog, $copiedLog) {
                    $auditLogIds = collect($auditLogs)->pluck('id')->toArray();
                    return in_array($createdLog->id, $auditLogIds) &&
                        !in_array($copiedLog->id, $auditLogIds);
                }));
    });

    test('index filters by date range', function () {
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

        $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', [
                'start_date' => now()->subDays(3)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ]))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('auditLogs.data', function ($auditLogs) use ($oldLog, $recentLog) {
                    $auditLogIds = collect($auditLogs)->pluck('id')->toArray();
                    return !in_array($oldLog->id, $auditLogIds) &&
                        in_array($recentLog->id, $auditLogIds);
                }));
    });

    test('index filters by search term', function () {
        $password1 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Gmail Account',
        ]);

        $password2 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'GitHub Access',
        ]);

        $auditLog1 = PasswordAuditLog::factory()->create([
            'password_id' => $password1->id,
            'user_id' => $this->user->id,
        ]);

        $auditLog2 = PasswordAuditLog::factory()->create([
            'password_id' => $password2->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['search' => 'Gmail']))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('auditLogs.data', function ($auditLogs) use ($auditLog1, $auditLog2) {
                    $auditLogIds = collect($auditLogs)->pluck('id')->toArray();
                    return in_array($auditLog1->id, $auditLogIds) &&
                        !in_array($auditLog2->id, $auditLogIds);
                }));
    });

    test('index respects per page parameter', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);
        PasswordAuditLog::factory()->count(25)->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['per_page' => 20]))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('auditLogs.data', fn($data) => count($data) === 20)
                ->where('auditLogs.total', 25));
    });

    test('index sorts by created_at desc by default', function () {
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

        $this->actingAs($this->user)->get(route('passwords.audit-logs.index'))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('auditLogs.data', function ($auditLogs) use ($newLog, $oldLog) {
                    $auditLogIds = collect($auditLogs)->pluck('id')->toArray();
                    return $auditLogIds[0] === $newLog->id && $auditLogIds[1] === $oldLog->id;
                }));
    });

    test('index validates invalid password_id for user', function () {
        $otherUserPassword = Password::factory()->create(['user_id' => $this->otherUser->id]);

        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['password_id' => $otherUserPassword->id]));

        // Should ignore invalid password_id and show all logs
        $response->assertOk();

        $response->assertInertia(fn($page) => $page
            ->component('audit-logs/index')
            ->where('filters.passwordId', null));
    });

    test('index validates invalid action parameter', function () {
        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['action' => 'invalid_action']));

        $response->assertSessionHasErrors(['action']);
    });

    test('index validates invalid date range', function () {
        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', [
                'start_date' => now()->format('Y-m-d'),
                'end_date' => now()->subDay()->format('Y-m-d'),
            ]));

        $response->assertSessionHasErrors(['end_date']);
    });

    test('index validates invalid per_page parameter', function () {
        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['per_page' => 100]));

        $response->assertSessionHasErrors(['per_page']);
    });

    test('index includes available actions in response', function () {
        $this->actingAs($this->user)->get(route('passwords.audit-logs.index'))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('availableActions.created', 'Created')
                ->where('availableActions.updated', 'Updated')
                ->where('availableActions.deleted', 'Deleted')
                ->where('availableActions.copied', 'Copied')
                ->where('availableActions.viewed', 'Viewed')
                ->where('availableActions.bulk_deleted', 'Bulk Deleted')
                ->where('availableActions.moved_to_folder', 'Moved to Folder')
                ->where('availableActions.removed_from_folder', 'Removed from Folder'));
    });

    test('index includes user passwords for filtering', function () {
        $password1 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Password 1',
        ]);

        $password2 = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Password 2',
        ]);

        $this->actingAs($this->user)->get(route('passwords.audit-logs.index'))
            ->assertInertia(fn($page) => $page
                ->component('audit-logs/index')
                ->where('userPasswords', function ($userPasswords) use ($password1, $password2) {
                    $passwordIds = collect($userPasswords)->pluck('id')->toArray();
                    return count($userPasswords) === 2 &&
                        in_array($password1->id, $passwordIds) &&
                        in_array($password2->id, $passwordIds);
                }));
    });
});
