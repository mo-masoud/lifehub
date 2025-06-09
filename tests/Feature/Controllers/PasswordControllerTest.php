<?php

use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('password index includes expiry filters in response', function () {
    $this->get(route('passwords.index', [
        'expiry_filter' => 'expired',
    ]))->assertInertia(fn($page) => $page
        ->component('passwords/index')
        ->where('filters.expiryFilter', 'expired'));
});

test('password index filters by expiry correctly', function () {
    $expired = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(5),
    ]);

    $expiresSoon = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(10),
    ]);

    $notExpiring = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(30),
    ]);

    // Test showing only expired passwords
    $this->get(route('passwords.index', [
        'expiry_filter' => 'expired',
    ]))->assertInertia(fn($page) => $page
        ->component('passwords/index')
        ->where('passwords.data', function ($passwords) use ($expired, $expiresSoon, $notExpiring) {
            $passwordIds = collect($passwords)->pluck('id')->toArray();
            return in_array($expired->id, $passwordIds) &&
                !in_array($expiresSoon->id, $passwordIds) &&
                !in_array($notExpiring->id, $passwordIds);
        }));

    // Test showing only expiring soon passwords
    $this->get(route('passwords.index', [
        'expiry_filter' => 'expires_soon',
    ]))->assertInertia(fn($page) => $page
        ->component('passwords/index')
        ->where('passwords.data', function ($passwords) use ($expired, $expiresSoon, $notExpiring) {
            $passwordIds = collect($passwords)->pluck('id')->toArray();
            return !in_array($expired->id, $passwordIds) &&
                in_array($expiresSoon->id, $passwordIds) &&
                !in_array($notExpiring->id, $passwordIds);
        }));
});

test('password index defaults to showing all passwords when no expiry filters provided', function () {
    $expired = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->subDays(5),
    ]);

    $expiresSoon = Password::factory()->create([
        'user_id' => $this->user->id,
        'expires_at' => now()->addDays(10),
    ]);

    $this->get(route('passwords.index'))
        ->assertInertia(fn($page) => $page
            ->component('passwords/index')
            ->where('filters.expiryFilter', 'all')
            ->where('passwords.data', function ($passwords) use ($expired, $expiresSoon) {
                $passwordIds = collect($passwords)->pluck('id')->toArray();
                return in_array($expired->id, $passwordIds) &&
                    in_array($expiresSoon->id, $passwordIds);
            }));
});

test('PasswordController → index renders correct page', function () {
    $this->get(route('passwords.index'))
        ->assertInertia(fn($page) => $page->component('passwords/index'));
});

test('PasswordController → index applies pagination', function () {
    // Create more than 10 passwords
    Password::factory(15)->create(['user_id' => $this->user->id]);

    $this->get(route('passwords.index', ['per_page' => 10]))
        ->assertInertia(fn($page) => $page
            ->component('passwords/index')
            ->where('passwords.per_page', 10)
            ->where('passwords.total', 15));
});

test('PasswordController → index applies search filter', function () {
    $password1 = Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Facebook Account',
    ]);

    $password2 = Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Gmail Account',
    ]);

    $this->get(route('passwords.index', ['search' => 'Facebook']))
        ->assertInertia(fn($page) => $page
            ->component('passwords/index')
            ->where('passwords.data', function ($passwords) use ($password1, $password2) {
                $passwordIds = collect($passwords)->pluck('id')->toArray();
                return in_array($password1->id, $passwordIds) &&
                    !in_array($password2->id, $passwordIds);
            }));
});

test('PasswordController → store creates password successfully', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'url' => 'https://example.com',
        'folder_id' => $folder->id,
        'notes' => 'Test notes',
    ];

    $response = $this->post(route('passwords.store'), $data);

    $response->assertRedirect(route('passwords.index'));
    $response->assertSessionHas('success', 'Password created successfully.');

    $this->assertDatabaseHas('passwords', [
        'user_id' => $this->user->id,
        'name' => 'Test Password',
        'username' => 'testuser',
        'url' => 'https://example.com',
        'folder_id' => $folder->id,
        'notes' => 'Test notes',
    ]);
});

test('PasswordController → store creates SSH password', function () {
    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => 'ssh user@server.com',
    ];

    $response = $this->post(route('passwords.store'), $data);

    $response->assertRedirect(route('passwords.index'));

    $password = Password::where('name', 'Test SSH')->first();
    expect($password->username)->toBe('user');
    expect($password->url)->toBe('server.com');
});

test('PasswordController → store validates required fields', function () {
    $response = $this->post(route('passwords.store'), []);

    $response->assertSessionHasErrors(['name', 'type', 'password']);
});

test('PasswordController → store requires username for normal type', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'password' => 'secret123',
    ];

    $response = $this->post(route('passwords.store'), $data);

    $response->assertSessionHasErrors(['username']);
});

test('PasswordController → update modifies password successfully', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'name' => 'Updated Password',
        'type' => 'normal',
        'username' => 'updateduser',
        'password' => 'newsecret123',
        'url' => 'https://updated.com',
        'notes' => 'Updated notes',
    ];

    $response = $this->put(route('passwords.update', $password), $data);

    $response->assertRedirect(route('passwords.index'));
    $response->assertSessionHas('success', 'Password updated successfully.');

    $password->refresh();
    expect($password->name)->toBe('Updated Password');
    expect($password->username)->toBe('updateduser');
    expect($password->url)->toBe('https://updated.com');
    expect($password->notes)->toBe('Updated notes');
});

test('PasswordController → update validates ownership', function () {
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);

    $data = [
        'name' => 'Hacked Password',
        'type' => 'normal',
        'username' => 'hacker',
        'password' => 'secret123',
    ];

    $response = $this->put(route('passwords.update', $password), $data);

    $response->assertStatus(403);
});

test('PasswordController → copy increments usage counter', function () {
    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'copied' => 5,
    ]);

    $response = $this->post(route('passwords.copy', $password));

    $response->assertStatus(200);
    $response->assertJson(['message' => 'Password copied to clipboard.']);

    $password->refresh();
    expect($password->copied)->toBe(6);
});

test('PasswordController → copy updates last used timestamp', function () {
    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'last_used_at' => now()->subHour(),
    ]);

    $oldTimestamp = $password->last_used_at;

    $response = $this->post(route('passwords.copy', $password));

    $response->assertStatus(200);

    $password->refresh();
    expect($password->last_used_at->isAfter($oldTimestamp))->toBeTrue();
});

test('PasswordController → copy creates audit log', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $response = $this->post(route('passwords.copy', $password));

    $response->assertStatus(200);

    $this->assertDatabaseHas('password_audit_logs', [
        'password_id' => $password->id,
        'user_id' => $this->user->id,
        'action' => 'copied',
    ]);
});

test('PasswordController → copy validates ownership', function () {
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->post(route('passwords.copy', $password));

    $response->assertStatus(403);
});

test('PasswordController → destroy deletes password', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $response = $this->delete(route('passwords.destroy', $password));

    $response->assertRedirect(route('passwords.index'));
    $response->assertSessionHas('success', 'Password deleted successfully.');

    $this->assertDatabaseMissing('passwords', ['id' => $password->id]);
});

test('PasswordController → destroy creates audit log before deletion', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $response = $this->delete(route('passwords.destroy', $password));

    $response->assertStatus(302);

    // Check that audit log was created (password_id will be null after deletion)
    $this->assertDatabaseHas('password_audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'deleted',
    ]);
});

test('PasswordController → destroy validates ownership', function () {
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->delete(route('passwords.destroy', $password));

    $response->assertStatus(403);
});

test('PasswordController → destroyBulk deletes multiple passwords', function () {
    $passwords = Password::factory(3)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $response = $this->post(route('passwords.destroy-bulk'), ['ids' => $ids]);

    $response->assertRedirect(route('passwords.index'));
    $response->assertSessionHas('success', 'Passwords deleted successfully.');

    foreach ($ids as $id) {
        $this->assertDatabaseMissing('passwords', ['id' => $id]);
    }
});

test('PasswordController → destroyBulk validates password ownership', function () {
    $myPassword = Password::factory()->create(['user_id' => $this->user->id]);
    $otherUser = User::factory()->create();
    $otherPassword = Password::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->post(route('passwords.destroy-bulk'), [
        'ids' => [$myPassword->id, $otherPassword->id]
    ]);

    // Should redirect back with validation errors, not 403
    $response->assertStatus(302);
    $response->assertSessionHasErrors('ids.1'); // The second ID should fail validation
});

test('PasswordController → destroyBulk creates bulk audit log', function () {
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $response = $this->post(route('passwords.destroy-bulk'), ['ids' => $ids]);

    $response->assertStatus(302);

    // Check that bulk audit logs were created
    $auditLogs = \App\Models\PasswordAuditLog::where('user_id', $this->user->id)
        ->where('action', 'bulk_deleted')
        ->get();

    expect($auditLogs)->toHaveCount(2); // One for each password
});

test('PasswordController → moveToFolder assigns passwords to folder', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $response = $this->post(route('passwords.move-to-folder'), [
        'ids' => $ids,
        'folder_id' => $folder->id,
    ]);

    $response->assertRedirect(route('passwords.index'));
    $response->assertSessionHas('success', 'Passwords moved to folder successfully.');

    foreach ($passwords as $password) {
        $password->refresh();
        expect($password->folder_id)->toBe($folder->id);
    }
});

test('PasswordController → moveToFolder moves to null folder', function () {
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $response = $this->post(route('passwords.move-to-folder'), [
        'ids' => $ids,
        'folder_id' => null,
    ]);

    $response->assertRedirect(route('passwords.index'));

    foreach ($passwords as $password) {
        $password->refresh();
        expect($password->folder_id)->toBeNull();
    }
});

test('PasswordController → moveToFolder creates audit log', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $response = $this->post(route('passwords.move-to-folder'), [
        'ids' => $ids,
        'folder_id' => $folder->id,
    ]);

    $response->assertStatus(302);

    $this->assertDatabaseHas('password_audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'moved_to_folder',
    ]);
});

test('PasswordController → removeFromFolder removes folder assignment', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create([
        'user_id' => $this->user->id,
        'folder_id' => $folder->id,
    ]);
    $ids = $passwords->pluck('id')->toArray();

    $response = $this->post(route('passwords.remove-from-folder'), ['ids' => $ids]);

    $response->assertRedirect(route('passwords.index'));
    $response->assertSessionHas('success', 'Passwords removed from folder successfully.');

    foreach ($passwords as $password) {
        $password->refresh();
        expect($password->folder_id)->toBeNull();
    }
});

test('PasswordController → removeFromFolder creates audit log', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create([
        'user_id' => $this->user->id,
        'folder_id' => $folder->id,
    ]);
    $ids = $passwords->pluck('id')->toArray();

    $response = $this->post(route('passwords.remove-from-folder'), ['ids' => $ids]);

    $response->assertStatus(302);

    $this->assertDatabaseHas('password_audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'removed_from_folder',
    ]);
});

test('PasswordController → index handles all filters together', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);

    $expiredSSH = Password::factory()->create([
        'user_id' => $this->user->id,
        'type' => 'ssh',
        'name' => 'Test SSH Server',
        'expires_at' => now()->subDays(5),
        'folder_id' => $folder->id,
    ]);

    $this->get(route('passwords.index', [
        'search' => 'SSH',
        'type' => 'ssh',
        'folder_id' => $folder->id,
        'expiry_filter' => 'expired',
        'sort' => 'name',
        'direction' => 'asc',
        'per_page' => 5,
    ]))->assertInertia(fn($page) => $page
        ->component('passwords/index')
        ->where('filters.search', 'SSH')
        ->where('filters.type', 'ssh')
        ->where('filters.folderId', (string)$folder->id)
        ->where('filters.expiryFilter', 'expired')
        ->where('filters.sort', 'name')
        ->where('filters.direction', 'asc')
        ->where('filters.perPage', '5'));
});

test('PasswordController → requires authentication for all actions', function () {
    auth()->logout();

    $password = Password::factory()->create();

    $this->get(route('passwords.index'))->assertRedirect('/login');
    $this->post(route('passwords.store'))->assertRedirect('/login');
    $this->put(route('passwords.update', $password))->assertRedirect('/login');
    $this->post(route('passwords.copy', $password))->assertRedirect('/login');
    $this->delete(route('passwords.destroy', $password))->assertRedirect('/login');
    $this->post(route('passwords.destroy-bulk'))->assertRedirect('/login');
    $this->post(route('passwords.move-to-folder'))->assertRedirect('/login');
    $this->post(route('passwords.remove-from-folder'))->assertRedirect('/login');
});
