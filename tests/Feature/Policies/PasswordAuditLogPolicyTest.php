<?php

use App\Models\Password;
use App\Models\PasswordAuditLog;
use App\Models\User;
use App\Policies\PasswordAuditLogPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
    $this->policy = new PasswordAuditLogPolicy();
});

test('PasswordAuditLogPolicy → viewAny returns true for authenticated user', function () {
    expect($this->policy->viewAny($this->user))->toBeTrue();
});

test('PasswordAuditLogPolicy → viewAny returns true for any user', function () {
    expect($this->policy->viewAny($this->otherUser))->toBeTrue();
});

test('PasswordAuditLogPolicy → view returns true when user owns the password', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);
    $auditLog = PasswordAuditLog::factory()->create([
        'password_id' => $password->id,
        'user_id' => $this->user->id,
    ]);

    expect($this->policy->view($this->user, $auditLog))->toBeTrue();
});

test('PasswordAuditLogPolicy → view returns false when user does not own the password', function () {
    $password = Password::factory()->create(['user_id' => $this->otherUser->id]);
    $auditLog = PasswordAuditLog::factory()->create([
        'password_id' => $password->id,
        'user_id' => $this->otherUser->id,
    ]);

    expect($this->policy->view($this->user, $auditLog))->toBeFalse();
});

test('PasswordAuditLogPolicy → view returns false when audit log has no password', function () {
    // Create audit log without password relationship
    $auditLog = new PasswordAuditLog([
        'user_id' => $this->user->id,
        'action' => 'deleted',
        'ip_address' => '127.0.0.1',
        'context' => 'web',
    ]);
    $auditLog->password = null; // Explicitly set password relationship to null

    expect($this->policy->view($this->user, $auditLog))->toBeFalse();
});

test('PasswordAuditLogPolicy → view returns false when password relationship is null', function () {
    // Create audit log without loading password relationship
    $auditLog = new PasswordAuditLog([
        'password_id' => 999, // Non-existent password
        'user_id' => $this->user->id,
        'action' => 'created',
        'ip_address' => '127.0.0.1',
        'context' => 'web',
    ]);
    $auditLog->password = null; // Simulate null relationship

    expect($this->policy->view($this->user, $auditLog))->toBeFalse();
});

test('PasswordAuditLogPolicy → view works with eager loaded password relationship', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);
    $auditLog = PasswordAuditLog::factory()->create([
        'password_id' => $password->id,
        'user_id' => $this->user->id,
    ]);

    // Load the relationship explicitly
    $auditLog->load('password');

    expect($this->policy->view($this->user, $auditLog))->toBeTrue();
});

test('PasswordAuditLogPolicy → view checks actual password ownership not audit log user_id', function () {
    // Password belongs to otherUser
    $password = Password::factory()->create(['user_id' => $this->otherUser->id]);

    // But audit log user_id points to current user (this can happen in some edge cases)
    $auditLog = PasswordAuditLog::factory()->create([
        'password_id' => $password->id,
        'user_id' => $this->user->id, // Different from password owner
    ]);

    // Should return false because the password belongs to otherUser
    expect($this->policy->view($this->user, $auditLog))->toBeFalse();
});

test('PasswordAuditLogPolicy → view handles deleted password gracefully', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);
    $auditLog = PasswordAuditLog::factory()->create([
        'password_id' => $password->id,
        'user_id' => $this->user->id,
    ]);

    // Delete the password
    $password->delete();

    // Simulate null password relationship after deletion
    $auditLog->password = null;

    expect($this->policy->view($this->user, $auditLog))->toBeFalse();
});

test('PasswordAuditLogPolicy → integrates with Laravel authorization system', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);
    $auditLog = PasswordAuditLog::factory()->create([
        'password_id' => $password->id,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user);

    expect($this->user->can('viewAny', PasswordAuditLog::class))->toBeTrue();
    expect($this->user->can('view', $auditLog))->toBeTrue();
});

test('PasswordAuditLogPolicy → Laravel authorization denies unauthorized access', function () {
    $password = Password::factory()->create(['user_id' => $this->otherUser->id]);
    $auditLog = PasswordAuditLog::factory()->create([
        'password_id' => $password->id,
        'user_id' => $this->otherUser->id,
    ]);

    $this->actingAs($this->user);

    expect($this->user->can('view', $auditLog))->toBeFalse();
});

test('PasswordAuditLogPolicy → view method signature is correct', function () {
    $reflection = new ReflectionMethod(PasswordAuditLogPolicy::class, 'view');
    $parameters = $reflection->getParameters();

    expect($parameters)->toHaveCount(2);
    expect($parameters[0]->getName())->toBe('user');
    expect($parameters[1]->getName())->toBe('auditLog');
    expect($reflection->getReturnType()->getName())->toBe('bool');
});

test('PasswordAuditLogPolicy → viewAny method signature is correct', function () {
    $reflection = new ReflectionMethod(PasswordAuditLogPolicy::class, 'viewAny');
    $parameters = $reflection->getParameters();

    expect($parameters)->toHaveCount(1);
    expect($parameters[0]->getName())->toBe('user');
    expect($reflection->getReturnType()->getName())->toBe('bool');
});
