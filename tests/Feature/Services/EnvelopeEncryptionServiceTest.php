<?php

use App\Services\EnvelopeEncryptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->encryptionService = app(EnvelopeEncryptionService::class);

    // Set up test encryption keys (exactly 32 bytes each)
    Config::set('encryption.master_keys', [
        1 => EnvelopeEncryptionService::generateTestKey('test_key_v1'),
        2 => EnvelopeEncryptionService::generateTestKey('test_key_v2'),
    ]);
    Config::set('encryption.master_key_version', 2);
});

test('can encrypt and decrypt data', function () {
    $plaintext = 'my_secret_password';

    $encrypted = $this->encryptionService->encrypt($plaintext);

    expect($encrypted)->toHaveKeys(['encrypted_data', 'encrypted_key', 'key_version']);
    expect($encrypted['key_version'])->toBe(2); // Current version
    expect($encrypted['encrypted_data'])->not->toBe($plaintext);
    expect($encrypted['encrypted_key'])->not->toBeEmpty();

    $decrypted = $this->encryptionService->decrypt(
        $encrypted['encrypted_data'],
        $encrypted['encrypted_key'],
        $encrypted['key_version']
    );

    expect($decrypted)->toBe($plaintext);
});

test('can encrypt with specific key version', function () {
    $plaintext = 'my_secret_password';

    $encrypted = $this->encryptionService->encrypt($plaintext, 1);

    expect($encrypted['key_version'])->toBe(1);

    $decrypted = $this->encryptionService->decrypt(
        $encrypted['encrypted_data'],
        $encrypted['encrypted_key'],
        $encrypted['key_version']
    );

    expect($decrypted)->toBe($plaintext);
});

test('can decrypt with old key versions', function () {
    $plaintext = 'my_secret_password';

    // Encrypt with version 1
    $encryptedV1 = $this->encryptionService->encrypt($plaintext, 1);

    // Should be able to decrypt even when current version is 2
    $decrypted = $this->encryptionService->decrypt(
        $encryptedV1['encrypted_data'],
        $encryptedV1['encrypted_key'],
        $encryptedV1['key_version']
    );

    expect($decrypted)->toBe($plaintext);
});

test('can re-encrypt with new key version', function () {
    $plaintext = 'my_secret_password';

    // Encrypt with version 1
    $encryptedV1 = $this->encryptionService->encrypt($plaintext, 1);

    // Re-encrypt with version 2
    $encryptedV2 = $this->encryptionService->reEncrypt(
        $encryptedV1['encrypted_data'],
        $encryptedV1['encrypted_key'],
        $encryptedV1['key_version'],
        2
    );

    expect($encryptedV2['key_version'])->toBe(2);
    expect($encryptedV2['encrypted_data'])->not->toBe($encryptedV1['encrypted_data']);
    expect($encryptedV2['encrypted_key'])->not->toBe($encryptedV1['encrypted_key']);

    $decrypted = $this->encryptionService->decrypt(
        $encryptedV2['encrypted_data'],
        $encryptedV2['encrypted_key'],
        $encryptedV2['key_version']
    );

    expect($decrypted)->toBe($plaintext);
});

test('throws exception for invalid key version', function () {
    $this->encryptionService->encrypt('test', 999);
})->throws(\RuntimeException::class, 'Master key version 999 not found');

test('encryption produces different results each time', function () {
    $plaintext = 'my_secret_password';

    $encrypted1 = $this->encryptionService->encrypt($plaintext);
    $encrypted2 = $this->encryptionService->encrypt($plaintext);

    // Should be different due to random DEK
    expect($encrypted1['encrypted_data'])->not->toBe($encrypted2['encrypted_data']);
    expect($encrypted1['encrypted_key'])->not->toBe($encrypted2['encrypted_key']);

    // But both should decrypt to the same value
    $decrypted1 = $this->encryptionService->decrypt(
        $encrypted1['encrypted_data'],
        $encrypted1['encrypted_key'],
        $encrypted1['key_version']
    );

    $decrypted2 = $this->encryptionService->decrypt(
        $encrypted2['encrypted_data'],
        $encrypted2['encrypted_key'],
        $encrypted2['key_version']
    );

    expect($decrypted1)->toBe($plaintext);
    expect($decrypted2)->toBe($plaintext);
});

test('get current key version', function () {
    expect($this->encryptionService->getCurrentKeyVersion())->toBe(2);
});

test('throws exception for invalid key size', function () {
    // Set up a key that's not 32 bytes
    Config::set('encryption.master_keys', [
        999 => base64_encode('short_key'), // Not 32 bytes
    ]);

    $this->encryptionService->encrypt('test', 999);
})->throws(\RuntimeException::class, 'Master key version 999 must be exactly 32 bytes (256 bits)');

test('generate test key without seed', function () {
    $key1 = EnvelopeEncryptionService::generateTestKey();
    $key2 = EnvelopeEncryptionService::generateTestKey();

    // Should be different keys since no seed is provided
    expect($key1)->not->toBe($key2);

    // Both should be valid base64 and decode to 32 bytes
    $decoded1 = base64_decode($key1);
    $decoded2 = base64_decode($key2);

    expect(strlen($decoded1))->toBe(32);
    expect(strlen($decoded2))->toBe(32);
});

test('generate test key with seed', function () {
    $seed = 'test_seed_123';
    $key1 = EnvelopeEncryptionService::generateTestKey($seed);
    $key2 = EnvelopeEncryptionService::generateTestKey($seed);

    // Should be identical keys with same seed
    expect($key1)->toBe($key2);

    // Should be valid base64 and decode to 32 bytes
    $decoded = base64_decode($key1);
    expect(strlen($decoded))->toBe(32);

    // Different seed should produce different key
    $key3 = EnvelopeEncryptionService::generateTestKey('different_seed');
    expect($key1)->not->toBe($key3);
});
