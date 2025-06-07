<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Facades\Config;
use RuntimeException;

class EnvelopeEncryptionService
{
    /**
     * Get the current master key version
     */
    public function getCurrentKeyVersion(): int
    {
        return Config::get('encryption.master_key_version', 1);
    }

    /**
     * Get master key for a specific version
     */
    protected function getMasterKey(int $version): string
    {
        $keys = Config::get('encryption.master_keys', []);

        if (!isset($keys[$version])) {
            throw new RuntimeException("Master key version {$version} not found");
        }

        // Decode base64 encoded key to get raw binary key
        $decodedKey = base64_decode($keys[$version]);

        // Ensure key is exactly 32 bytes for AES-256
        if (strlen($decodedKey) !== 32) {
            throw new RuntimeException("Master key version {$version} must be exactly 32 bytes (256 bits)");
        }

        return $decodedKey;
    }

    /**
     * Generate a random data encryption key (DEK)
     */
    protected function generateDataKey(): string
    {
        return random_bytes(32); // 256-bit key
    }

    /**
     * Encrypt data using envelope encryption
     *
     * @param string $plaintext The data to encrypt
     * @param int|null $keyVersion Optional key version (uses current if null)
     * @return array ['encrypted_data' => string, 'encrypted_key' => string, 'key_version' => int]
     */
    public function encrypt(string $plaintext, ?int $keyVersion = null): array
    {
        $keyVersion = $keyVersion ?? $this->getCurrentKeyVersion();
        $masterKey = $this->getMasterKey($keyVersion);

        // Generate random DEK
        $dataKey = $this->generateDataKey();

        // Encrypt the plaintext with the DEK
        $dataEncrypter = new Encrypter($dataKey, 'AES-256-CBC');
        $encryptedData = $dataEncrypter->encryptString($plaintext);

        // Encrypt the DEK with the master key
        $masterEncrypter = new Encrypter($masterKey, 'AES-256-CBC');
        $encryptedKey = $masterEncrypter->encryptString(base64_encode($dataKey));

        return [
            'encrypted_data' => $encryptedData,
            'encrypted_key' => $encryptedKey,
            'key_version' => $keyVersion,
        ];
    }

    /**
     * Decrypt data using envelope encryption
     *
     * @param string $encryptedData The encrypted data
     * @param string $encryptedKey The encrypted DEK
     * @param int $keyVersion The key version used for encryption
     * @return string The decrypted plaintext
     */
    public function decrypt(string $encryptedData, string $encryptedKey, int $keyVersion): string
    {
        $masterKey = $this->getMasterKey($keyVersion);

        // Decrypt the DEK with the master key
        $masterEncrypter = new Encrypter($masterKey, 'AES-256-CBC');
        $dataKeyBase64 = $masterEncrypter->decryptString($encryptedKey);
        $dataKey = base64_decode($dataKeyBase64);

        // Decrypt the data with the DEK
        $dataEncrypter = new Encrypter($dataKey, 'AES-256-CBC');
        return $dataEncrypter->decryptString($encryptedData);
    }

    /**
     * Re-encrypt data with a new key version
     *
     * @param string $encryptedData Current encrypted data
     * @param string $encryptedKey Current encrypted DEK
     * @param int $currentKeyVersion Current key version
     * @param int|null $newKeyVersion New key version (uses current if null)
     * @return array New encryption result
     */
    public function reEncrypt(string $encryptedData, string $encryptedKey, int $currentKeyVersion, ?int $newKeyVersion = null): array
    {
        // Decrypt with old key
        $plaintext = $this->decrypt($encryptedData, $encryptedKey, $currentKeyVersion);

        // Re-encrypt with new key
        return $this->encrypt($plaintext, $newKeyVersion);
    }

    /**
     * Generate a secure 32-byte key for testing purposes
     *
     * @param string $seed Optional seed for deterministic testing
     * @return string Base64 encoded key
     */
    public static function generateTestKey(string $seed = null): string
    {
        if ($seed) {
            // Generate deterministic key from seed for testing
            return base64_encode(substr(hash('sha256', $seed, true), 0, 32));
        }

        // Generate random key
        return base64_encode(random_bytes(32));
    }
}
