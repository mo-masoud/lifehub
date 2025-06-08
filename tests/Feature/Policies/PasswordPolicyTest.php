<?php

use App\Models\Password;
use App\Models\User;
use App\Policies\PasswordPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('password policy: authenticated user can view any passwords', function () {
    $user = User::factory()->create();
    $policy = new PasswordPolicy;

    expect($policy->viewAny($user))->toBeTrue();
});

test('password policy: user can view their own password', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $user->id]);
    $policy = new PasswordPolicy;

    expect($policy->view($user, $password))->toBeTrue();
});

test('password policy: user cannot view another users password', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);
    $policy = new PasswordPolicy;

    expect($policy->view($user, $password))->toBeFalse();
});

test('password policy: authenticated user can create passwords', function () {
    $user = User::factory()->create();
    $policy = new PasswordPolicy;

    expect($policy->create($user))->toBeTrue();
});

test('password policy: user can update their own password', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $user->id]);
    $policy = new PasswordPolicy;

    expect($policy->update($user, $password))->toBeTrue();
});

test('password policy: user cannot update another users password', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);
    $policy = new PasswordPolicy;

    expect($policy->update($user, $password))->toBeFalse();
});

test('password policy: user can delete their own password', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $user->id]);
    $policy = new PasswordPolicy;

    expect($policy->delete($user, $password))->toBeTrue();
});

test('password policy: user cannot delete another users password', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);
    $policy = new PasswordPolicy;

    expect($policy->delete($user, $password))->toBeFalse();
});

test('password policy: user can restore their own password', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $user->id]);
    $policy = new PasswordPolicy;

    expect($policy->restore($user, $password))->toBeTrue();
});

test('password policy: user cannot restore another users password', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);
    $policy = new PasswordPolicy;

    expect($policy->restore($user, $password))->toBeFalse();
});

test('password policy: user can force delete their own password', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $user->id]);
    $policy = new PasswordPolicy;

    expect($policy->forceDelete($user, $password))->toBeTrue();
});

test('password policy: user cannot force delete another users password', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);
    $policy = new PasswordPolicy;

    expect($policy->forceDelete($user, $password))->toBeFalse();
});

test('password policy: integrates with laravel authorization', function () {
    $user = User::factory()->create();
    $ownPassword = Password::factory()->create(['user_id' => $user->id]);
    $otherPassword = Password::factory()->create();

    $this->actingAs($user);

    // Test authorization using Laravel's built-in methods
    expect($user->can('view', $ownPassword))->toBeTrue();
    expect($user->can('view', $otherPassword))->toBeFalse();
    expect($user->can('update', $ownPassword))->toBeTrue();
    expect($user->can('update', $otherPassword))->toBeFalse();
    expect($user->can('delete', $ownPassword))->toBeTrue();
    expect($user->can('delete', $otherPassword))->toBeFalse();
});

test('password policy: user ownership takes precedence over folder', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    // Create a folder owned by user
    $userFolder = \App\Models\Folder::factory()->create(['user_id' => $user->id]);

    // Create a password in that folder but owned by other user (edge case)
    $password = Password::factory()->create([
        'user_id' => $otherUser->id,
        'folder_id' => $userFolder->id,
    ]);

    $policy = new PasswordPolicy;

    // Policy should still check password ownership, not folder ownership
    expect($policy->view($user, $password))->toBeFalse();
    expect($policy->update($user, $password))->toBeFalse();
    expect($policy->delete($user, $password))->toBeFalse();
});

test('password policy: user can access password without folder', function () {
    $user = User::factory()->create();
    $password = Password::factory()->create([
        'user_id' => $user->id,
        'folder_id' => null,
    ]);

    $policy = new PasswordPolicy;

    expect($policy->view($user, $password))->toBeTrue();
    expect($policy->update($user, $password))->toBeTrue();
    expect($policy->delete($user, $password))->toBeTrue();
});
