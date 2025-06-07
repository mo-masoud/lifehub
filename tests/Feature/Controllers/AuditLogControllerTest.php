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

        $response = $this->actingAs($this->user)->get(route('passwords.audit-logs.index'));

        $auditLogIds = collect($response->viewData('page')['props']['auditLogs']['data'])
            ->pluck('id')->toArray();

        expect($auditLogIds)
            ->toContain($userAuditLog->id)
            ->not->toContain($otherUserAuditLog->id);
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

        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['password_id' => $password1->id]));

        $auditLogIds = collect($response->viewData('page')['props']['auditLogs']['data'])
            ->pluck('id')->toArray();

        expect($auditLogIds)
            ->toContain($auditLog1->id)
            ->not->toContain($auditLog2->id);
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

        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['action' => 'created']));

        $auditLogIds = collect($response->viewData('page')['props']['auditLogs']['data'])
            ->pluck('id')->toArray();

        expect($auditLogIds)
            ->toContain($createdLog->id)
            ->not->toContain($copiedLog->id);
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

        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', [
                'start_date' => now()->subDays(3)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ]));

        $auditLogIds = collect($response->viewData('page')['props']['auditLogs']['data'])
            ->pluck('id')->toArray();

        expect($auditLogIds)
            ->not->toContain($oldLog->id)
            ->toContain($recentLog->id);
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

        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['search' => 'Gmail']));

        $auditLogIds = collect($response->viewData('page')['props']['auditLogs']['data'])
            ->pluck('id')->toArray();

        expect($auditLogIds)
            ->toContain($auditLog1->id)
            ->not->toContain($auditLog2->id);
    });

    test('index respects per page parameter', function () {
        $password = Password::factory()->create(['user_id' => $this->user->id]);
        PasswordAuditLog::factory()->count(25)->create([
            'password_id' => $password->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['per_page' => 20]));

        $auditLogs = $response->viewData('page')['props']['auditLogs'];

        expect($auditLogs['data'])->toHaveCount(20)
            ->and($auditLogs['total'])->toBe(25);
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

        $response = $this->actingAs($this->user)->get(route('passwords.audit-logs.index'));

        $auditLogIds = collect($response->viewData('page')['props']['auditLogs']['data'])
            ->pluck('id')->toArray();

        expect($auditLogIds[0])->toBe($newLog->id)
            ->and($auditLogIds[1])->toBe($oldLog->id);
    });

    test('index validates invalid password_id for user', function () {
        $otherUserPassword = Password::factory()->create(['user_id' => $this->otherUser->id]);

        $response = $this->actingAs($this->user)
            ->get(route('passwords.audit-logs.index', ['password_id' => $otherUserPassword->id]));

        // Should ignore invalid password_id and show all logs
        $response->assertOk();

        $filters = $response->viewData('page')['props']['filters'];
        expect($filters['passwordId'])->toBeNull();
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
        $response = $this->actingAs($this->user)->get(route('passwords.audit-logs.index'));

        $availableActions = $response->viewData('page')['props']['availableActions'];

        expect($availableActions)->toHaveKey('created', 'Created')
            ->and($availableActions)->toHaveKey('updated', 'Updated')
            ->and($availableActions)->toHaveKey('deleted', 'Deleted')
            ->and($availableActions)->toHaveKey('copied', 'Copied')
            ->and($availableActions)->toHaveKey('viewed', 'Viewed')
            ->and($availableActions)->toHaveKey('bulk_deleted', 'Bulk Deleted')
            ->and($availableActions)->toHaveKey('moved_to_folder', 'Moved to Folder')
            ->and($availableActions)->toHaveKey('removed_from_folder', 'Removed from Folder');
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

        $response = $this->actingAs($this->user)->get(route('passwords.audit-logs.index'));

        $userPasswords = $response->viewData('page')['props']['userPasswords'];

        expect($userPasswords)->toHaveCount(2);

        $passwordIds = collect($userPasswords)->pluck('id')->toArray();
        expect($passwordIds)->toContain($password1->id, $password2->id);
    });
});
