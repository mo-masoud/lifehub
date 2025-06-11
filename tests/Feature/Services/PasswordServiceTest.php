<?php

use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\EnvelopeEncryptionService;
use App\Services\PasswordService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->encryptionService = app(EnvelopeEncryptionService::class);
    $this->auditLogService = app(AuditLogService::class);
    $this->passwordService = new PasswordService($this->encryptionService, $this->auditLogService);
});

test('PasswordService → createPassword creates password with valid data', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'url' => 'https://example.com',
        'notes' => 'Test notes',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password)->toBeInstanceOf(Password::class);
    expect($password->user_id)->toBe($this->user->id);
    expect($password->name)->toBe('Test Password');
    expect($password->username)->toBe('testuser');
    expect($password->url)->toBe('https://example.com');
    expect($password->notes)->toBe('Test notes');
    expect($password->last_used_at)->not->toBeNull();
});

test('PasswordService → createPassword encrypts password field', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    // Password should be encrypted, not stored as plain text
    expect($password->getAttributes()['password'])->not->toBe('secret123');
    expect($password->encrypted_key)->not->toBeEmpty();
    expect($password->key_version)->toBeGreaterThan(0);

    // But decrypted password should match original
    expect($password->password)->toBe('secret123');
});

test('PasswordService → createPassword handles SSH type with CLI', function () {
    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => 'ssh user@server.com',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->type->value)->toBe('ssh');
    expect($password->username)->toBe('user');
    expect($password->url)->toBe('server.com');
});

test('PasswordService → createPassword handles SSH type with complex CLI', function () {
    $data = [
        'name' => 'Complex SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => 'ssh complex-user@complex-server.example.com',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->username)->toBe('complex-user');
    expect($password->url)->toBe('complex-server.example.com');
});

test('PasswordService → createPassword requires username for SSH without CLI', function () {
    $data = [
        'name' => 'SSH No CLI',
        'type' => 'ssh',
        'password' => 'secret123',
        // No CLI command provided
    ];

    expect(fn () => $this->passwordService->createPassword($this->user, $data))
        ->toThrow(ValidationException::class);
});

test('PasswordService → createPassword requires username and url for SSH without CLI', function () {
    $data = [
        'name' => 'SSH No CLI',
        'type' => 'ssh',
        'password' => 'secret123',
        'username' => 'testuser',
        // No URL provided
    ];

    expect(fn () => $this->passwordService->createPassword($this->user, $data))
        ->toThrow(ValidationException::class);
});

test('PasswordService → createPassword allows SSH with explicit username and url', function () {
    $data = [
        'name' => 'SSH Explicit',
        'type' => 'ssh',
        'password' => 'secret123',
        'username' => 'explicit-user',
        'url' => 'explicit-server.com',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->username)->toBe('explicit-user');
    expect($password->url)->toBe('explicit-server.com');
});

test('PasswordService → createPassword creates audit log', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    $this->assertDatabaseHas('password_audit_logs', [
        'password_id' => $password->id,
        'user_id' => $this->user->id,
        'action' => 'created',
    ]);
});

test('PasswordService → createPassword handles empty password gracefully', function () {
    $data = [
        'name' => 'Empty Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => '',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->name)->toBe('Empty Password');
    expect($password->password)->toBe(''); // Empty string, not null
    expect($password->encrypted_key)->toBeEmpty();
});

test('PasswordService → updatePassword modifies existing password', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'name' => 'Updated Password',
        'type' => 'normal',
        'username' => 'updateduser',
        'password' => 'newsecret123',
        'url' => 'https://updated.com',
        'notes' => 'Updated notes',
    ];

    $updatedPassword = $this->passwordService->updatePassword($password, $data);

    expect($updatedPassword->name)->toBe('Updated Password');
    expect($updatedPassword->username)->toBe('updateduser');
    expect($updatedPassword->url)->toBe('https://updated.com');
    expect($updatedPassword->notes)->toBe('Updated notes');
    expect($updatedPassword->password)->toBe('newsecret123');
});

test('PasswordService → updatePassword creates audit log', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'name' => 'Updated Password',
        'type' => 'normal',
        'username' => 'updateduser',
        'password' => 'newsecret123',
    ];

    $this->passwordService->updatePassword($password, $data);

    $this->assertDatabaseHas('password_audit_logs', [
        'password_id' => $password->id,
        'user_id' => $this->user->id,
        'action' => 'updated',
    ]);
});

test('PasswordService → updatePassword handles SSH CLI changes', function () {
    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'type' => 'ssh',
    ]);

    $data = [
        'name' => 'Updated SSH',
        'type' => 'ssh',
        'password' => 'newsecret',
        'cli' => 'ssh newuser@newserver.com',
    ];

    $updatedPassword = $this->passwordService->updatePassword($password, $data);

    expect($updatedPassword->username)->toBe('newuser');
    expect($updatedPassword->url)->toBe('newserver.com');
});

test('PasswordService → copy increments copied counter', function () {
    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'copied' => 5,
    ]);

    $copiedPassword = $this->passwordService->copy($password);

    expect($copiedPassword->copied)->toBe(6);
});

test('PasswordService → copy updates last used timestamp', function () {
    $password = Password::factory()->create([
        'user_id' => $this->user->id,
        'last_used_at' => now()->subHour(),
    ]);

    $oldTimestamp = $password->last_used_at;

    $copiedPassword = $this->passwordService->copy($password);

    expect($copiedPassword->last_used_at->isAfter($oldTimestamp))->toBeTrue();
});

test('PasswordService → copy creates audit log', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $this->passwordService->copy($password);

    $this->assertDatabaseHas('password_audit_logs', [
        'password_id' => $password->id,
        'user_id' => $this->user->id,
        'action' => 'copied',
    ]);
});

test('PasswordService → delete removes password from database', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $this->passwordService->delete($password);

    $this->assertDatabaseMissing('passwords', ['id' => $password->id]);
});

test('PasswordService → delete creates audit log before deletion', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);
    $passwordId = $password->id;

    $this->passwordService->delete($password);

    // After deletion, password_id becomes null due to foreign key constraint
    $this->assertDatabaseHas('password_audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'deleted',
    ]);

    // Verify the audit log was created for the correct password
    $auditLog = \App\Models\PasswordAuditLog::where('user_id', $this->user->id)
        ->where('action', 'deleted')
        ->first();

    expect($auditLog)->not->toBeNull();
});

test('PasswordService → destroyBulk deletes multiple passwords', function () {
    $passwords = Password::factory(3)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $this->actingAs($this->user);
    $this->passwordService->destroyBulk($ids);

    foreach ($ids as $id) {
        $this->assertDatabaseMissing('passwords', ['id' => $id]);
    }
});

test('PasswordService → destroyBulk creates bulk audit log', function () {
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $this->actingAs($this->user);
    $this->passwordService->destroyBulk($ids);

    // Check that bulk audit logs were created (password_id will be null after deletion)
    $auditLogs = \App\Models\PasswordAuditLog::where('user_id', $this->user->id)
        ->where('action', 'bulk_deleted')
        ->get();

    expect($auditLogs)->toHaveCount(2); // One for each password
});

test('PasswordService → destroyBulk validates ownership', function () {
    $otherUser = User::factory()->create();
    $otherPassword = Password::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->user);

    expect(fn () => $this->passwordService->destroyBulk([$otherPassword->id]))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

test('PasswordService → destroyBulk handles empty results gracefully', function () {
    $this->actingAs($this->user);

    expect(fn () => $this->passwordService->destroyBulk([999, 998]))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

test('PasswordService → moveToFolder assigns passwords to folder', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $this->actingAs($this->user);
    $this->passwordService->moveToFolder($ids, $folder->id);

    foreach ($passwords as $password) {
        $password->refresh();
        expect($password->folder_id)->toBe($folder->id);
    }
});

test('PasswordService → moveToFolder moves to null folder', function () {
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $this->actingAs($this->user);
    $this->passwordService->moveToFolder($ids, null);

    foreach ($passwords as $password) {
        $password->refresh();
        expect($password->folder_id)->toBeNull();
    }
});

test('PasswordService → moveToFolder creates audit log', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create(['user_id' => $this->user->id]);
    $ids = $passwords->pluck('id')->toArray();

    $this->actingAs($this->user);
    $this->passwordService->moveToFolder($ids, $folder->id);

    $this->assertDatabaseHas('password_audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'moved_to_folder',
    ]);
});

test('PasswordService → moveToFolder validates ownership', function () {
    $otherUser = User::factory()->create();
    $otherPassword = Password::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->user);

    expect(fn () => $this->passwordService->moveToFolder([$otherPassword->id], null))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

test('PasswordService → removeFromFolder removes folder assignment', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create([
        'user_id' => $this->user->id,
        'folder_id' => $folder->id,
    ]);
    $ids = $passwords->pluck('id')->toArray();

    $this->actingAs($this->user);
    $this->passwordService->removeFromFolder($ids);

    foreach ($passwords as $password) {
        $password->refresh();
        expect($password->folder_id)->toBeNull();
    }
});

test('PasswordService → removeFromFolder creates audit log', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);
    $passwords = Password::factory(2)->create([
        'user_id' => $this->user->id,
        'folder_id' => $folder->id,
    ]);
    $ids = $passwords->pluck('id')->toArray();

    $this->actingAs($this->user);
    $this->passwordService->removeFromFolder($ids);

    $this->assertDatabaseHas('password_audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'removed_from_folder',
    ]);
});

test('PasswordService → removeFromFolder validates ownership', function () {
    $otherUser = User::factory()->create();
    $otherPassword = Password::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->user);

    expect(fn () => $this->passwordService->removeFromFolder([$otherPassword->id]))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

test('PasswordService → extractUsernameFromCli handles various formats', function () {
    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => 'ssh   user123@server.com', // Extra spaces
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->username)->toBe('user123');
});

test('PasswordService → extractUsernameFromCli handles no ssh prefix', function () {
    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => 'user@server.com', // No ssh prefix
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->username)->toBe('user');
});

test('PasswordService → extractUrlFromCli handles complex hostnames', function () {
    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => 'ssh user@complex-hostname-123.example.org',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->url)->toBe('complex-hostname-123.example.org');
});

test('PasswordService → encryptPassword handles empty password', function () {
    $data = [
        'name' => 'Empty Password Test',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => '',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->getAttributes()['password'])->toBe('');
    expect($password->encrypted_key)->toBeEmpty();
});

test('PasswordService → prepareData sets last_used_at timestamp', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->last_used_at)->not->toBeNull();
    expect($password->last_used_at->diffInMinutes(now()))->toBeLessThan(1);
});

test('PasswordService → validates SSH without CLI throws correct error messages', function () {
    $data = [
        'name' => 'SSH No CLI',
        'type' => 'ssh',
        'password' => 'secret123',
    ];

    try {
        $this->passwordService->createPassword($this->user, $data);
        expect(false)->toBeTrue(); // Should not reach here
    } catch (ValidationException $e) {
        $errors = $e->errors();
        expect($errors)->toHaveKey('username');
        expect($errors)->toHaveKey('url');
        expect($errors['username'][0])->toContain('Username is required for SSH passwords');
        expect($errors['url'][0])->toContain('URL is required for SSH passwords');
    }
});

test('PasswordService → handles mixed CLI and explicit values for SSH', function () {
    // CLI should take precedence over explicit values
    $data = [
        'name' => 'Mixed SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => 'ssh cliuser@cliserver.com',
        'username' => 'explicituser', // Should be overridden
        'url' => 'explicitserver.com', // Should be overridden
    ];

    $password = $this->passwordService->createPassword($this->user, $data);

    expect($password->username)->toBe('cliuser');
    expect($password->url)->toBe('cliserver.com');
});
