<?php

use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can move passwords to folder', function () {
    $user = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $user->id]);
    $passwords = Password::factory()->count(3)->create(['user_id' => $user->id, 'folder_id' => null]);

    $response = $this->actingAs($user)
        ->post(route('passwords.move-to-folder'), [
            'ids' => $passwords->pluck('id')->toArray(),
            'folder_id' => $folder->id,
        ]);

    $response->assertRedirect(route('passwords.index'))
        ->assertSessionHas('success', 'Passwords moved to folder successfully.');

    foreach ($passwords as $password) {
        $this->assertDatabaseHas('passwords', [
            'id' => $password->id,
            'folder_id' => $folder->id,
        ]);
    }
});

test('user can move passwords to no folder', function () {
    $user = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $user->id]);
    $passwords = Password::factory()->count(3)->create(['user_id' => $user->id, 'folder_id' => $folder->id]);

    $response = $this->actingAs($user)
        ->post(route('passwords.move-to-folder'), [
            'ids' => $passwords->pluck('id')->toArray(),
            'folder_id' => null,
        ]);

    $response->assertRedirect(route('passwords.index'))
        ->assertSessionHas('success', 'Passwords moved to folder successfully.');

    foreach ($passwords as $password) {
        $this->assertDatabaseHas('passwords', [
            'id' => $password->id,
            'folder_id' => null,
        ]);
    }
});

test('user cannot move other users passwords', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $user->id]);
    $password = Password::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)
        ->post(route('passwords.move-to-folder'), [
            'ids' => [$password->id],
            'folder_id' => $folder->id,
        ]);

    $response->assertStatus(302)
        ->assertSessionHasErrors(['ids.0']);
});

test('user cannot move passwords to other users folder', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $otherUser->id]);
    $password = Password::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
        ->post(route('passwords.move-to-folder'), [
            'ids' => [$password->id],
            'folder_id' => $folder->id,
        ]);

    $response->assertStatus(302)
        ->assertSessionHasErrors(['folder_id']);
});

test('user can remove passwords from folder', function () {
    $user = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $user->id]);
    $passwords = Password::factory()->count(3)->create(['user_id' => $user->id, 'folder_id' => $folder->id]);

    $response = $this->actingAs($user)
        ->post(route('passwords.remove-from-folder'), [
            'ids' => $passwords->pluck('id')->toArray(),
        ]);

    $response->assertRedirect(route('passwords.index'))
        ->assertSessionHas('success', 'Passwords removed from folder successfully.');

    foreach ($passwords as $password) {
        $this->assertDatabaseHas('passwords', [
            'id' => $password->id,
            'folder_id' => null,
        ]);
    }
});

test('user cannot remove other users passwords from folder', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $otherUser->id]);
    $password = Password::factory()->create(['user_id' => $otherUser->id, 'folder_id' => $folder->id]);

    $response = $this->actingAs($user)
        ->post(route('passwords.remove-from-folder'), [
            'ids' => [$password->id],
        ]);

    $response->assertStatus(302)
        ->assertSessionHasErrors(['ids.0']);
});

test('move to folder requires password ids', function () {
    $user = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
        ->post(route('passwords.move-to-folder'), [
            'folder_id' => $folder->id,
        ]);

    $response->assertStatus(302)
        ->assertSessionHasErrors(['ids']);
});

test('remove from folder requires password ids', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('passwords.remove-from-folder'), []);

    $response->assertStatus(302)
        ->assertSessionHasErrors(['ids']);
});

test('move to folder validates maximum passwords', function () {
    $user = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $user->id]);
    $ids = range(1, 101); // More than the maximum of 100

    $response = $this->actingAs($user)
        ->post(route('passwords.move-to-folder'), [
            'ids' => $ids,
            'folder_id' => $folder->id,
        ]);

    $response->assertStatus(302)
        ->assertSessionHasErrors(['ids']);
});
