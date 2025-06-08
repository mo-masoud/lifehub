<?php

use App\Enums\PasswordTypes;
use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use App\Services\EnvelopeEncryptionService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use App\Services\PasswordService;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Set up test encryption keys for envelope encryption
    Config::set('encryption.master_keys', [
        1 => EnvelopeEncryptionService::generateTestKey('test_key_v1'),
        2 => EnvelopeEncryptionService::generateTestKey('test_key_v2'),
    ]);
    Config::set('encryption.master_key_version', 1);
});

describe('Password Model', function () {
    test('can create a password', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);

        $password = Password::factory()->create([
            'user_id' => $user->id,
            'folder_id' => $folder->id,
            'name' => 'Test Password',
            'username' => 'testuser',
            'password' => 'secret123',
            'type' => PasswordTypes::Normal,
        ]);

        expect($password)->toBeInstanceOf(Password::class)
            ->and($password->name)->toBe('Test Password')
            ->and($password->username)->toBe('testuser')
            ->and($password->user_id)->toBe($user->id)
            ->and($password->folder_id)->toBe($folder->id)
            ->and($password->type)->toBe(PasswordTypes::Normal);
    });

    test('has fillable attributes', function () {
        $password = new Password();

        expect($password->getFillable())->toBe([
            'user_id',
            'type',
            'name',
            'username',
            'password',
            'encrypted_key',
            'key_version',
            'url',
            'notes',
            'folder_id',
            'copied',
            'last_used_at',
            'expires_at',
        ]);
    });

    test('has correct casts', function () {
        $password = new Password();
        $casts = $password->getCasts();

        expect($casts)->toHaveKey('user_id', 'integer')
            ->and($casts)->toHaveKey('type', PasswordTypes::class)
            ->and($casts)->toHaveKey('folder_id', 'integer')
            ->and($casts)->toHaveKey('key_version', 'integer')
            ->and($casts)->toHaveKey('copied', 'integer')
            ->and($casts)->toHaveKey('last_used_at', 'datetime')
            ->and($casts)->toHaveKey('expires_at', 'date');
    });

    test('has appended attributes', function () {
        $password = new Password();

        expect($password->getAppends())->toBe([
            'cli',
            'is_expired',
            'is_expired_soon',
            'last_used_at_formatted',
            'expires_at_formatted',
            'password_power',
        ]);
    });

    test('belongs to a user', function () {
        $user = User::factory()->create();
        $password = Password::factory()->create(['user_id' => $user->id]);

        expect($password->user)->toBeInstanceOf(User::class)
            ->and($password->user->id)->toBe($user->id);
    });

    test('belongs to a folder', function () {
        $folder = Folder::factory()->create();
        $password = Password::factory()->create(['folder_id' => $folder->id]);

        expect($password->folder)->toBeInstanceOf(Folder::class)
            ->and($password->folder->id)->toBe($folder->id);
    });

    test('can have null folder', function () {
        $password = Password::factory()->create(['folder_id' => null]);

        expect($password->folder)->toBeNull()
            ->and($password->folder_id)->toBeNull();
    });

    test('password is encrypted and decrypted correctly', function () {
        $plainPassword = 'mySecretPassword123';

        // Create password using the factory
        $password = Password::factory()->withPlainPassword($plainPassword)->create();

        // Refresh the model to ensure we get fresh data from database
        $password->refresh();

        // Password should be encrypted in database
        $rawPassword = DB::table('passwords')->where('id', $password->id)->value('password');
        expect($rawPassword)->not->toBe($plainPassword);

        // Should have envelope encryption fields
        $passwordRecord = DB::table('passwords')->where('id', $password->id)->first();
        expect($passwordRecord->encrypted_key)->not->toBeNull();
        expect($passwordRecord->key_version)->not->toBeNull();

        // But accessible as plain text through accessor
        expect($password->password)->toBe($plainPassword);
    });

    test('can create password with specific key version', function () {
        $plainPassword = 'mySecretPassword123';

        $password = Password::factory()->withPlainPassword($plainPassword, 1)->create();

        expect($password->key_version)->toBe(1);
        expect($password->password)->toBe($plainPassword);
    });

    test('can create password through service', function () {
        $user = User::factory()->create();
        $plainPassword = 'mySecretPassword123';
        $passwordService = app(PasswordService::class);

        $password = $passwordService->createPassword($user, [
            'type' => 'normal',
            'name' => 'Service Test Password',
            'username' => 'serviceuser',
            'password' => $plainPassword,
        ]);

        expect($password)->toBeInstanceOf(Password::class);
        expect($password->name)->toBe('Service Test Password');
        expect($password->username)->toBe('serviceuser');
        expect($password->password)->toBe($plainPassword);
        expect($password->encrypted_key)->not->toBeNull();
        expect($password->key_version)->not->toBeNull();
    });

    test('can update password through service', function () {
        $password = Password::factory()->withPlainPassword('oldPassword123')->create();
        $newPassword = 'newPassword456';
        $passwordService = app(PasswordService::class);

        $updatedPassword = $passwordService->updatePassword($password, [
            'name' => 'Updated Password Name',
            'password' => $newPassword,
        ]);

        expect($updatedPassword->name)->toBe('Updated Password Name');
        expect($updatedPassword->password)->toBe($newPassword);
        expect($updatedPassword->encrypted_key)->not->toBeNull();
        expect($updatedPassword->key_version)->not->toBeNull();
    });

    test('cli attribute generates correct ssh command', function () {
        $password = Password::factory()->create([
            'type' => PasswordTypes::SSH,
            'username' => 'admin',
            'url' => 'server.example.com',
        ]);

        expect($password->cli)->toBe('ssh admin@server.example.com');
    });

    test('cli attribute is null for non-ssh passwords', function () {
        $password = Password::factory()->create([
            'type' => PasswordTypes::Normal,
            'username' => 'admin',
            'url' => 'server.example.com',
        ]);

        expect($password->cli)->toBeNull();
    });

    test('password name is unique per user', function () {
        $user = User::factory()->create();

        Password::factory()->create([
            'user_id' => $user->id,
            'name' => 'Unique Password',
        ]);

        expect(function () use ($user) {
            Password::factory()->create([
                'user_id' => $user->id,
                'name' => 'Unique Password',
            ]);
        })->toThrow(QueryException::class);
    });

    test('different users can have passwords with same name', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $password1 = Password::factory()->create([
            'user_id' => $user1->id,
            'name' => 'Same Name',
        ]);

        $password2 = Password::factory()->create([
            'user_id' => $user2->id,
            'name' => 'Same Name',
        ]);

        expect($password1->name)->toBe($password2->name)
            ->and($password1->user_id)->not->toBe($password2->user_id);
    });

    test('is deleted when user is deleted', function () {
        $user = User::factory()->create();
        $password = Password::factory()->create(['user_id' => $user->id]);

        expect(Password::find($password->id))->not->toBeNull();

        $user->delete();

        expect(Password::find($password->id))->toBeNull();
    });

    test('folder_id is set to null when folder is deleted', function () {
        $folder = Folder::factory()->create();
        $password = Password::factory()->create(['folder_id' => $folder->id]);

        expect($password->folder_id)->toBe($folder->id);

        $folder->delete();

        expect($password->fresh()->folder_id)->toBeNull();
    });

    test('expires soon scope returns passwords expiring within 15 days', function () {
        $soonExpiring = Password::factory()->create([
            'expires_at' => now()->addDays(10),
        ]);

        $laterExpiring = Password::factory()->create([
            'expires_at' => now()->addDays(20),
        ]);

        $noExpiry = Password::factory()->create([
            'expires_at' => null,
        ]);

        $expiringSoon = Password::expiresSoon()->get();

        expect($expiringSoon->pluck('id')->toArray())
            ->toContain($soonExpiring->id)
            ->not->toContain($laterExpiring->id)
            ->not->toContain($noExpiry->id);
    });

    test('sort by last used scope orders correctly', function () {
        $recentlyUsed = Password::factory()->create([
            'last_used_at' => now()->subDays(1),
            'updated_at' => now()->subDays(2),
        ]);

        $olderUsed = Password::factory()->create([
            'last_used_at' => now()->subDays(5),
            'updated_at' => now()->subDays(1),
        ]);

        $neverUsed = Password::factory()->create([
            'last_used_at' => null,
            'updated_at' => now()->subHours(1),
        ]);

        $sorted = Password::sortByLastUsed()->get();

        // The recently used should be first
        expect($sorted->first()->id)->toBe($recentlyUsed->id);

        // Find positions to verify order
        $positions = $sorted->pluck('id')->flip();
        expect($positions[$recentlyUsed->id])->toBeLessThan($positions[$olderUsed->id])
            ->and($positions[$olderUsed->id])->toBeLessThan($positions[$neverUsed->id]);
    });

    test('sort by copied scope orders by copied count', function () {
        $mostCopied = Password::factory()->create(['copied' => 100]);
        $lessCopied = Password::factory()->create(['copied' => 50]);
        $notCopied = Password::factory()->create(['copied' => 0]);

        $sorted = Password::sortByCopied()->get();

        expect($sorted->first()->id)->toBe($mostCopied->id)
            ->and($sorted->last()->id)->toBe($notCopied->id);
    });

    test('filter by type scope filters correctly', function () {
        $normalPassword = Password::factory()->create(['type' => PasswordTypes::Normal]);
        $sshPassword = Password::factory()->create(['type' => PasswordTypes::SSH]);

        $normalPasswords = Password::filterByType(PasswordTypes::Normal)->get();
        $sshPasswords = Password::filterByType(PasswordTypes::SSH)->get();

        expect($normalPasswords->pluck('id')->toArray())
            ->toContain($normalPassword->id)
            ->not->toContain($sshPassword->id);

        expect($sshPasswords->pluck('id')->toArray())
            ->toContain($sshPassword->id)
            ->not->toContain($normalPassword->id);
    });

    test('filter by folder scope filters by folder id', function () {
        $folder = Folder::factory()->create();
        $passwordInFolder = Password::factory()->create(['folder_id' => $folder->id]);
        $passwordWithoutFolder = Password::factory()->create(['folder_id' => null]);

        $folderPasswords = Password::filterByFolder($folder->id)->get();
        $unfolderedPasswords = Password::filterByFolder(null)->get();

        expect($folderPasswords->pluck('id')->toArray())
            ->toContain($passwordInFolder->id)
            ->not->toContain($passwordWithoutFolder->id);

        expect($unfolderedPasswords->pluck('id')->toArray())
            ->toContain($passwordWithoutFolder->id)
            ->not->toContain($passwordInFolder->id);
    });

    test('has timestamps', function () {
        $password = Password::factory()->create();

        expect($password->created_at)->not->toBeNull()
            ->and($password->updated_at)->not->toBeNull();
    });

    test('can be updated', function () {
        $password = Password::factory()->create(['name' => 'Original Name']);

        $password->update(['name' => 'Updated Name']);

        expect($password->fresh()->name)->toBe('Updated Name');
    });

    test('required fields validation', function () {
        $user = User::factory()->create();

        // user_id is required
        expect(function () {
            Password::create(['name' => 'Test']);
        })->toThrow(QueryException::class);

        // name is required
        expect(function () use ($user) {
            Password::create(['user_id' => $user->id]);
        })->toThrow(QueryException::class);
    });

    test('default values are set correctly', function () {
        $user = User::factory()->create();

        $password = Password::create([
            'user_id' => $user->id,
            'name' => 'Test Password',
            'username' => 'testuser',
            'password' => 'secret',
        ]);

        // Refresh to get database defaults
        $password = $password->fresh();

        expect($password->type)->toBe(PasswordTypes::Normal)
            ->and($password->copied)->toBe(0);
    });

    test('can have optional fields', function () {
        $user = User::factory()->create();

        $password = Password::factory()->create([
            'user_id' => $user->id,
            'url' => null,
            'notes' => null,
            'folder_id' => null,
            'last_used_at' => null,
            'expires_at' => null,
        ]);

        expect($password->url)->toBeNull()
            ->and($password->notes)->toBeNull()
            ->and($password->folder_id)->toBeNull()
            ->and($password->last_used_at)->toBeNull()
            ->and($password->expires_at)->toBeNull();
    });

    test('can retrieve password with all relationships', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);
        $password = Password::factory()->create([
            'user_id' => $user->id,
            'folder_id' => $folder->id,
        ]);

        $passwordWithRelations = Password::with(['user', 'folder'])->find($password->id);

        expect($passwordWithRelations->user)->toBeInstanceOf(User::class)
            ->and($passwordWithRelations->folder)->toBeInstanceOf(Folder::class);
    });

    test('type enum values are handled correctly', function () {
        $normalPassword = Password::factory()->create(['type' => PasswordTypes::Normal]);
        $sshPassword = Password::factory()->create(['type' => PasswordTypes::SSH]);

        expect($normalPassword->type)->toBe(PasswordTypes::Normal)
            ->and($normalPassword->type->value)->toBe('normal')
            ->and($sshPassword->type)->toBe(PasswordTypes::SSH)
            ->and($sshPassword->type->value)->toBe('ssh');
    });

    test('copied count can be incremented', function () {
        $password = Password::factory()->create(['copied' => 5]);

        $password->increment('copied');

        expect($password->fresh()->copied)->toBe(6);
    });

    test('last used at can be updated', function () {
        $password = Password::factory()->create(['last_used_at' => null]);

        $now = now();
        $password->update(['last_used_at' => $now]);

        expect($password->fresh()->last_used_at->toDateTimeString())
            ->toBe($now->toDateTimeString());
    });

    test('filter by expiry scope handles all filter', function () {
        $expired = Password::factory()->create([
            'expires_at' => now()->subDays(5),
        ]);

        $expiresSoon = Password::factory()->create([
            'expires_at' => now()->addDays(10),
        ]);

        $notExpiring = Password::factory()->create([
            'expires_at' => now()->addDays(30),
        ]);

        $noExpiry = Password::factory()->create([
            'expires_at' => null,
        ]);

        // 'all' filter should return all passwords
        $results = Password::filterByExpiry('all')->get();

        expect($results->pluck('id')->toArray())
            ->toContain($expired->id)
            ->toContain($expiresSoon->id)
            ->toContain($notExpiring->id)
            ->toContain($noExpiry->id);
    });

    test('filter by expiry scope handles expired filter', function () {
        $expired = Password::factory()->create([
            'expires_at' => now()->subDays(5),
        ]);

        $expiresSoon = Password::factory()->create([
            'expires_at' => now()->addDays(10),
        ]);

        $notExpiring = Password::factory()->create([
            'expires_at' => now()->addDays(30),
        ]);

        $noExpiry = Password::factory()->create([
            'expires_at' => null,
        ]);

        // 'expired' filter should return only expired passwords
        $results = Password::filterByExpiry('expired')->get();

        expect($results->pluck('id')->toArray())
            ->toContain($expired->id)
            ->not->toContain($expiresSoon->id)
            ->not->toContain($notExpiring->id)
            ->not->toContain($noExpiry->id);
    });

    test('filter by expiry scope handles expires soon filter', function () {
        $expired = Password::factory()->create([
            'expires_at' => now()->subDays(5),
        ]);

        $expiresSoon = Password::factory()->create([
            'expires_at' => now()->addDays(10),
        ]);

        $notExpiring = Password::factory()->create([
            'expires_at' => now()->addDays(30),
        ]);

        $noExpiry = Password::factory()->create([
            'expires_at' => null,
        ]);

        // 'expires_soon' filter should return only expiring soon passwords
        $results = Password::filterByExpiry('expires_soon')->get();

        expect($results->pluck('id')->toArray())
            ->not->toContain($expired->id)
            ->toContain($expiresSoon->id)
            ->not->toContain($notExpiring->id)
            ->not->toContain($noExpiry->id);
    });

    test('filter by expiry scope handles default parameters', function () {
        $expired = Password::factory()->create([
            'expires_at' => now()->subDays(5),
        ]);

        $expiresSoon = Password::factory()->create([
            'expires_at' => now()->addDays(10),
        ]);

        $notExpiring = Password::factory()->create([
            'expires_at' => now()->addDays(30),
        ]);

        $noExpiry = Password::factory()->create([
            'expires_at' => null,
        ]);

        // Default parameters (null) should return all passwords
        $results = Password::filterByExpiry()->get();

        expect($results->pluck('id')->toArray())
            ->toContain($expired->id)
            ->toContain($expiresSoon->id)
            ->toContain($notExpiring->id)
            ->toContain($noExpiry->id);
    });
});
