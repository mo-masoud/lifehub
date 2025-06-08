<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Envelope Encryption Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration manages envelope encryption for sensitive data like
    | passwords. Envelope encryption uses a master key to encrypt data
    | encryption keys (DEKs) which are used to encrypt the actual data.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Current Master Key Version
    |--------------------------------------------------------------------------
    |
    | This is the current version of the master key that will be used for
    | new encryptions. When rotating keys, increment this version and add
    | the new key to the master_keys array below.
    |
    */

    'master_key_version' => env('ENCRYPTION_MASTER_KEY_VERSION', 1),

    /*
    |--------------------------------------------------------------------------
    | Master Keys
    |--------------------------------------------------------------------------
    |
    | These are the master keys used for envelope encryption. Each key should
    | be a 32-byte (256-bit) key encoded as base64. You can generate keys using:
    |
    | php artisan tinker
    | echo base64_encode(random_bytes(32));
    |
    | Keep all previous versions for backward compatibility during key rotation.
    |
    */

    'master_keys' => [
        1 => env('ENCRYPTION_MASTER_KEY_V1', base64_encode(substr(hash('sha256', config('app.key').'_envelope_v1', true), 0, 32))),
        // Add new versions here during key rotation:
        // 2 => env('ENCRYPTION_MASTER_KEY_V2'),
        // 3 => env('ENCRYPTION_MASTER_KEY_V3'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Automatic Legacy Migration
    |--------------------------------------------------------------------------
    |
    | When enabled, the system will automatically detect and migrate legacy
    | Laravel encrypted data to envelope encryption when accessed. This
    | provides seamless backward compatibility during the upgrade process.
    |
    */

    'auto_migrate_legacy' => env('ENCRYPTION_AUTO_MIGRATE_LEGACY', true),

    /*
    |--------------------------------------------------------------------------
    | Key Rotation Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for automatic key rotation behaviors.
    |
    */

    'rotation' => [
        // Automatically re-encrypt with new key version when data is accessed
        'auto_reencrypt_on_access' => env('ENCRYPTION_AUTO_REENCRYPT', false),

        // Maximum age of encrypted data before recommending re-encryption (days)
        'max_age_days' => env('ENCRYPTION_MAX_AGE_DAYS', 365),
    ],
];
