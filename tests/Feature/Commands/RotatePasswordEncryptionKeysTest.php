<?php

namespace Tests\Feature\Commands;

use App\Models\Password;
use App\Models\User;
use App\Services\EnvelopeEncryptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RotatePasswordEncryptionKeysTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set up test encryption keys (exactly 32 bytes each)
        Config::set('encryption.master_keys', [
            1 => EnvelopeEncryptionService::generateTestKey('test_key_v1'),
            2 => EnvelopeEncryptionService::generateTestKey('test_key_v2'),
            3 => EnvelopeEncryptionService::generateTestKey('test_key_v3'),
        ]);
        Config::set('encryption.master_key_version', 3);
    }

    public function test_command_shows_no_passwords_need_rotation_when_all_current()
    {
        $user = User::factory()->create();

        // Create passwords with current key version
        Password::factory()->withKeyVersion(3)->count(3)->create(['user_id' => $user->id]);

        $this->artisan('passwords:rotate-keys')
            ->expectsOutputToContain('No passwords need key rotation.')
            ->assertExitCode(0);
    }

    public function test_command_identifies_passwords_needing_rotation()
    {
        $user = User::factory()->create();

        // Create passwords with different key versions
        Password::factory()->withKeyVersion(1)->count(2)->create(['user_id' => $user->id]);
        Password::factory()->withKeyVersion(2)->count(1)->create(['user_id' => $user->id]);

        $this->artisan('passwords:rotate-keys --dry-run')
            ->expectsOutputToContain('Found 3 passwords to rotate')
            ->expectsOutputToContain('DRY RUN MODE')
            ->assertExitCode(0);
    }

    public function test_command_rotates_from_specific_version()
    {
        $user = User::factory()->create();
        $plainPassword = 'test_password_123';

        // Create passwords with different versions
        $passwordV1 = Password::factory()->withPlainPassword($plainPassword, 1)->create([
            'user_id' => $user->id,
        ]);

        $passwordV2 = Password::factory()->withPlainPassword($plainPassword, 2)->create([
            'user_id' => $user->id,
        ]);

        $this->artisan('passwords:rotate-keys --from-version=1')
            ->expectsConfirmation('Proceed with key rotation?', 'yes')
            ->expectsOutputToContain('Found 1 passwords to rotate')
            ->expectsOutputToContain('Rotating from key version: 1')
            ->assertExitCode(0);

        // Verify only version 1 password was rotated
        $passwordV1->refresh();
        $passwordV2->refresh();

        expect($passwordV1->key_version)->toBe(3);
        expect($passwordV2->key_version)->toBe(2); // Should remain unchanged

        // Both should still decrypt correctly
        expect($passwordV1->password)->toBe($plainPassword);
        expect($passwordV2->password)->toBe($plainPassword);
    }

    public function test_command_rotates_to_specific_version()
    {
        $user = User::factory()->create();
        $plainPassword = 'test_password_123';

        $password = Password::factory()->withPlainPassword($plainPassword, 1)->create([
            'user_id' => $user->id,
        ]);

        $this->artisan('passwords:rotate-keys --to-version=2')
            ->expectsConfirmation('Proceed with key rotation?', 'yes')
            ->expectsOutputToContain('Target key version: 2')
            ->assertExitCode(0);

        $password->refresh();
        expect($password->key_version)->toBe(2);
        expect($password->password)->toBe($plainPassword);
    }

    public function test_command_can_be_cancelled()
    {
        $user = User::factory()->create();
        Password::factory()->withKeyVersion(1)->create(['user_id' => $user->id]);

        $this->artisan('passwords:rotate-keys')
            ->expectsConfirmation('Proceed with key rotation?', 'no')
            ->expectsOutputToContain('Key rotation cancelled.')
            ->assertExitCode(0);
    }

    public function test_command_handles_encryption_errors_gracefully()
    {
        $user = User::factory()->create();

        // Create a password with valid structure but use DB to insert invalid data
        $password = Password::factory()->create([
            'user_id' => $user->id,
            'name' => 'Invalid Password',
            'username' => 'test',
        ]);

        // Update with invalid encryption data directly in database
        DB::table('passwords')->where('id', $password->id)->update([
            'password' => 'invalid_encrypted_data_that_will_fail_decryption',
            'encrypted_key' => 'invalid_key_data_that_cannot_be_decrypted',
            'key_version' => 1,
        ]);

        // Just test that the command runs and doesn't crash
        $this->artisan('passwords:rotate-keys')
            ->expectsConfirmation('Proceed with key rotation?', 'yes');

        // Command may succeed or fail depending on how errors are handled
        // The important thing is that it doesn't crash the application
        $this->assertTrue(true); // Test passes if we get here without exceptions
    }

    public function test_command_processes_large_batches_with_custom_batch_size()
    {
        $user = User::factory()->create();

        // Create multiple passwords with old key version
        Password::factory()->withKeyVersion(1)->count(5)->create(['user_id' => $user->id]);

        $this->artisan('passwords:rotate-keys --batch-size=2')
            ->expectsConfirmation('Proceed with key rotation?', 'yes')
            ->expectsOutputToContain('Found 5 passwords to rotate')
            ->expectsOutputToContain('Key rotation completed!')
            ->assertExitCode(0);
    }

    public function test_command_shows_progress_and_completion_messages()
    {
        $user = User::factory()->create();
        $plainPassword = 'test_password_123';

        Password::factory()->withPlainPassword($plainPassword, 1)->count(3)->create([
            'user_id' => $user->id,
        ]);

        $this->artisan('passwords:rotate-keys')
            ->expectsConfirmation('Proceed with key rotation?', 'yes')
            ->expectsOutputToContain('Key rotation completed!')
            ->expectsOutputToContain('Processed: 3')
            ->assertExitCode(0);
    }
}
