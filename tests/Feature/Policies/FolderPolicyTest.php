<?php

use App\Models\Folder;
use App\Models\User;
use App\Policies\FolderPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Folder Policy', function () {
    test('authenticated user can view any folders', function () {
        $user = User::factory()->create();
        $policy = new FolderPolicy();

        expect($policy->viewAny($user))->toBeTrue();
    });

    test('user can view their own folder', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);
        $policy = new FolderPolicy();

        expect($policy->view($user, $folder))->toBeTrue();
    });

    test('user cannot view another users folder', function () {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $otherUser->id]);
        $policy = new FolderPolicy();

        expect($policy->view($user, $folder))->toBeFalse();
    });

    test('authenticated user can create folders', function () {
        $user = User::factory()->create();
        $policy = new FolderPolicy();

        expect($policy->create($user))->toBeTrue();
    });

    test('user can update their own folder', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);
        $policy = new FolderPolicy();

        expect($policy->update($user, $folder))->toBeTrue();
    });

    test('user cannot update another users folder', function () {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $otherUser->id]);
        $policy = new FolderPolicy();

        expect($policy->update($user, $folder))->toBeFalse();
    });

    test('user can delete their own folder', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);
        $policy = new FolderPolicy();

        expect($policy->delete($user, $folder))->toBeTrue();
    });

    test('user cannot delete another users folder', function () {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $otherUser->id]);
        $policy = new FolderPolicy();

        expect($policy->delete($user, $folder))->toBeFalse();
    });

    test('user can restore their own folder', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);
        $policy = new FolderPolicy();

        expect($policy->restore($user, $folder))->toBeTrue();
    });

    test('user cannot restore another users folder', function () {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $otherUser->id]);
        $policy = new FolderPolicy();

        expect($policy->restore($user, $folder))->toBeFalse();
    });

    test('user can force delete their own folder', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);
        $policy = new FolderPolicy();

        expect($policy->forceDelete($user, $folder))->toBeTrue();
    });

    test('user cannot force delete another users folder', function () {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $otherUser->id]);
        $policy = new FolderPolicy();

        expect($policy->forceDelete($user, $folder))->toBeFalse();
    });

    test('policy integrates with laravel authorization', function () {
        $user = User::factory()->create();
        $ownFolder = Folder::factory()->create(['user_id' => $user->id]);
        $otherFolder = Folder::factory()->create();

        $this->actingAs($user);

        // Test authorization using Laravel's built-in methods
        expect($user->can('view', $ownFolder))->toBeTrue();
        expect($user->can('view', $otherFolder))->toBeFalse();
        expect($user->can('update', $ownFolder))->toBeTrue();
        expect($user->can('update', $otherFolder))->toBeFalse();
        expect($user->can('delete', $ownFolder))->toBeTrue();
        expect($user->can('delete', $otherFolder))->toBeFalse();
    });
});
