<?php

namespace Tests\Feature\Passwords;

use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BulkFolderActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_move_passwords_to_folder()
    {
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
    }

    public function test_user_can_move_passwords_to_no_folder()
    {
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
    }

    public function test_user_cannot_move_other_users_passwords()
    {
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
    }

    public function test_user_cannot_move_passwords_to_other_users_folder()
    {
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
    }

    public function test_user_can_remove_passwords_from_folder()
    {
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
    }

    public function test_user_cannot_remove_other_users_passwords_from_folder()
    {
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
    }

    public function test_move_to_folder_requires_password_ids()
    {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->post(route('passwords.move-to-folder'), [
                'folder_id' => $folder->id,
            ]);

        $response->assertStatus(302)
            ->assertSessionHasErrors(['ids']);
    }

    public function test_remove_from_folder_requires_password_ids()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('passwords.remove-from-folder'), []);

        $response->assertStatus(302)
            ->assertSessionHasErrors(['ids']);
    }

    public function test_move_to_folder_validates_maximum_passwords()
    {
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
    }
}
