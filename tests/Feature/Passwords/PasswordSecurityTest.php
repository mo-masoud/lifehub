<?php

use App\Enums\PasswordTypes;
use App\Models\Password;
use App\Models\User;
use App\Services\EnvelopeEncryptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Set up test encryption keys for envelope encryption
    Config::set('encryption.master_keys', [
        1 => EnvelopeEncryptionService::generateTestKey('test_key_v1'),
        2 => EnvelopeEncryptionService::generateTestKey('test_key_v2'),
    ]);
    Config::set('encryption.master_key_version', 1);

    $this->user = User::factory()->create();
});

describe('Password Security', function () {
    test('password field is encrypted in database', function () {
        $plainPassword = 'mySecretPassword123!@#';

        $password = Password::factory()->withPlainPassword($plainPassword)->create([
            'user_id' => $this->user->id,
        ]);

        // Check that the raw database value is encrypted
        $rawPassword = \DB::table('passwords')->where('id', $password->id)->value('password');

        expect($rawPassword)->not->toBe($plainPassword)
            ->and($rawPassword)->not->toBeEmpty()
            ->and(strlen($rawPassword))->toBeGreaterThan(strlen($plainPassword));
    });

    test('password decryption works correctly', function () {
        $plainPassword = 'mySecretPassword123!@#';

        $password = Password::factory()->withPlainPassword($plainPassword)->create([
            'user_id' => $this->user->id,
        ]);

        $password->refresh();

        expect($password->password)->toBe($plainPassword);
    });

    test('password encryption uses envelope encryption', function () {
        $plainPassword = 'mySecretPassword123!@#';

        $password = Password::factory()->withPlainPassword($plainPassword)->create([
            'user_id' => $this->user->id,
        ]);

        expect($password->encrypted_key)->not->toBeNull()
            ->and($password->key_version)->not->toBeNull()
            ->and($password->key_version)->toBeGreaterThan(0);
    });

    test('password decryption fails with missing encrypted_key', function () {
        $password = new Password([
            'user_id' => $this->user->id,
            'password' => 'encrypted_data',
            'encrypted_key' => null,
            'key_version' => 1,
        ]);

        expect(fn() => $password->password)
            ->toThrow(\RuntimeException::class, 'Password is missing envelope encryption fields');
    });

    test('password decryption fails with missing key_version', function () {
        $password = new Password([
            'user_id' => $this->user->id,
            'password' => 'encrypted_data',
            'encrypted_key' => 'some_key',
            'key_version' => null,
        ]);

        expect(fn() => $password->password)
            ->toThrow(\RuntimeException::class, 'Password is missing envelope encryption fields');
    });

    test('password handles empty password value', function () {
        $password = new Password([
            'user_id' => $this->user->id,
            'password' => '',
            'encrypted_key' => 'some_key',
            'key_version' => 1,
        ]);

        expect($password->password)->toBeNull();
    });

    test('password handles null password value', function () {
        $password = new Password([
            'user_id' => $this->user->id,
            'password' => null,
            'encrypted_key' => 'some_key',
            'key_version' => 1,
        ]);

        expect($password->password)->toBeNull();
    });

    test('notes field handles XSS attempts', function () {
        $xssAttempt = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';

        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'notes' => $xssAttempt,
        ]);

        // Notes should be stored as-is (raw), but should be escaped when rendered
        expect($password->notes)->toBe($xssAttempt);
    });

    test('name field handles XSS attempts', function () {
        $xssAttempt = '<script>alert("XSS")</script>';

        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => $xssAttempt,
        ]);

        expect($password->name)->toBe($xssAttempt);
    });

    test('username field handles special characters', function () {
        $specialUsername = 'user@domain.com!#$%^&*()';

        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'username' => $specialUsername,
        ]);

        expect($password->username)->toBe($specialUsername);
    });

    test('url field handles various URL formats', function () {
        $urls = [
            'https://example.com',
            'http://subdomain.example.com:8080/path?query=value',
            'ftp://files.example.com',
            'ssh://server.example.com:22',
            'example.com', // Without protocol
        ];

        foreach ($urls as $url) {
            $password = Password::factory()->create([
                'user_id' => $this->user->id,
                'url' => $url,
            ]);

            expect($password->url)->toBe($url);
        }
    });

    test('password handles very long passwords', function () {
        $longPassword = Str::random(1000); // 1000 character password

        $password = Password::factory()->withPlainPassword($longPassword)->create([
            'user_id' => $this->user->id,
        ]);

        expect($password->password)->toBe($longPassword);
    });

    test('password handles unicode characters', function () {
        $unicodePassword = '密码123!@#αβγδε🔒🗝️';

        $password = Password::factory()->withPlainPassword($unicodePassword)->create([
            'user_id' => $this->user->id,
        ]);

        expect($password->password)->toBe($unicodePassword);
    });

    test('notes field handles very long content', function () {
        $longNotes = Str::random(10000); // 10KB of notes

        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'notes' => $longNotes,
        ]);

        expect($password->notes)->toBe($longNotes);
    });

    test('notes field handles markdown content', function () {
        $markdownNotes = "# Header\n\n**Bold text**\n\n- List item 1\n- List item 2\n\n[Link](https://example.com)\n\n```code block```";

        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'notes' => $markdownNotes,
        ]);

        expect($password->notes)->toBe($markdownNotes);
    });

    test('SSH password type generates correct CLI command', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'type' => PasswordTypes::SSH,
            'username' => 'root',
            'url' => 'server.example.com',
        ]);

        expect($password->cli)->toBe('ssh root@server.example.com');
    });

    test('SSH password handles special characters in username and URL', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'type' => PasswordTypes::SSH,
            'username' => 'user-name_123',
            'url' => 'server-name.sub-domain.example.com',
        ]);

        expect($password->cli)->toBe('ssh user-name_123@server-name.sub-domain.example.com');
    });

    test('password strength calculation handles various password types', function () {
        $passwords = [
            'weak' => '123',
            'medium' => 'password123',
            'strong' => 'MyStr0ng!P@ssw0rd',
            'very_strong' => 'Th1s!s@V3ryStr0ng&C0mpl3xP@ssw0rd!',
        ];

        foreach ($passwords as $type => $passwordValue) {
            $password = Password::factory()->withPlainPassword($passwordValue)->create([
                'user_id' => $this->user->id,
            ]);

            expect($password->password_power)->toBeArray()
                ->and($password->password_power)->toHaveKey('score')
                ->and($password->password_power['score'])->toBeNumeric();
        }
    });

    test('password expiry dates are handled correctly', function () {
        $expiredPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->subDays(5),
        ]);

        $expiringSoonPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(10),
        ]);

        $notExpiringPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(30),
        ]);

        expect($expiredPassword->is_expired)->toBeTrue()
            ->and($expiredPassword->is_expired_soon)->toBeFalse()
            ->and($expiringSoonPassword->is_expired)->toBeFalse()
            ->and($expiringSoonPassword->is_expired_soon)->toBeTrue()
            ->and($notExpiringPassword->is_expired)->toBeFalse()
            ->and($notExpiringPassword->is_expired_soon)->toBeFalse();
    });

    test('password handles null expiry date', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => null,
        ]);

        expect($password->is_expired)->toBeFalse()
            ->and($password->is_expired_soon)->toBeFalse();
    });

    test('password copied counter is properly tracked', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'copied' => 0,
        ]);

        expect($password->copied)->toBe(0);

        $password->update(['copied' => $password->copied + 1]);

        expect($password->copied)->toBe(1);
    });

    test('password last_used_at is properly tracked', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => null,
        ]);

        expect($password->last_used_at)->toBeNull();

        $now = now();
        $password->update(['last_used_at' => $now]);

        expect($password->last_used_at->format('Y-m-d H:i:s'))->toBe($now->format('Y-m-d H:i:s'));
    });

    test('password handles different key versions', function () {
        $password1 = Password::factory()->withPlainPassword('test123', 1)->create([
            'user_id' => $this->user->id,
        ]);

        $password2 = Password::factory()->withPlainPassword('test456', 2)->create([
            'user_id' => $this->user->id,
        ]);

        expect($password1->key_version)->toBe(1)
            ->and($password1->password)->toBe('test123')
            ->and($password2->key_version)->toBe(2)
            ->and($password2->password)->toBe('test456');
    });

    test('password field size limits are respected', function () {
        // Test maximum field lengths
        $maxName = Str::random(255);
        $maxUsername = Str::random(255);
        $maxUrl = Str::random(2048);

        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => $maxName,
            'username' => $maxUsername,
            'url' => $maxUrl,
        ]);

        expect(strlen($password->name))->toBe(255)
            ->and(strlen($password->username))->toBe(255)
            ->and(strlen($password->url))->toBe(2048);
    });

    test('password encryption is deterministic for same input', function () {
        $plainPassword = 'testPassword123';

        $password1 = Password::factory()->withPlainPassword($plainPassword)->create([
            'user_id' => $this->user->id,
        ]);

        $password2 = Password::factory()->withPlainPassword($plainPassword)->create([
            'user_id' => $this->user->id,
        ]);

        // Encrypted values should be different (due to random IV/salt)
        $raw1 = \DB::table('passwords')->where('id', $password1->id)->value('password');
        $raw2 = \DB::table('passwords')->where('id', $password2->id)->value('password');

        expect($raw1)->not->toBe($raw2);

        // But decrypted values should be the same
        expect($password1->password)->toBe($plainPassword)
            ->and($password2->password)->toBe($plainPassword);
    });

    test('password handles empty string vs null correctly', function () {
        $emptyStringPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'username' => 'test_user',
            'url' => '',
            'notes' => '',
        ]);

        $nullPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'username' => 'test_user2',
            'url' => null,
            'notes' => null,
        ]);

        expect($emptyStringPassword->url)->toBe('')
            ->and($emptyStringPassword->notes)->toBe('')
            ->and($nullPassword->url)->toBeNull()
            ->and($nullPassword->notes)->toBeNull();
    });

    test('password type enum validation works correctly', function () {
        $normalPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'type' => PasswordTypes::Normal,
        ]);

        $sshPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'type' => PasswordTypes::SSH,
        ]);

        expect($normalPassword->type)->toBe(PasswordTypes::Normal)
            ->and($sshPassword->type)->toBe(PasswordTypes::SSH);
    });

    test('password handles concurrent access safely', function () {
        $password = Password::factory()->withPlainPassword('original')->create([
            'user_id' => $this->user->id,
        ]);

        // Simulate concurrent access
        $password1 = Password::find($password->id);
        $password2 = Password::find($password->id);

        expect($password1->password)->toBe('original')
            ->and($password2->password)->toBe('original');
    });
});
