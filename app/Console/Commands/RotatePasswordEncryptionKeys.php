<?php

namespace App\Console\Commands;

use App\Models\Password;
use App\Services\EnvelopeEncryptionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RotatePasswordEncryptionKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'passwords:rotate-keys
                           {--from-version= : Source key version to rotate from}
                           {--to-version= : Target key version to rotate to (uses current if not specified)}
                           {--batch-size=100 : Number of passwords to process per batch}
                           {--dry-run : Show what would be rotated without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rotate encryption keys for stored passwords';

    protected EnvelopeEncryptionService $encryptionService;

    public function __construct(EnvelopeEncryptionService $encryptionService)
    {
        parent::__construct();
        $this->encryptionService = $encryptionService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $fromVersion = $this->option('from-version');
        $toVersion = $this->option('to-version') ?? $this->encryptionService->getCurrentKeyVersion();
        $batchSize = (int) $this->option('batch-size');
        $dryRun = $this->option('dry-run');

        $this->info("Password Encryption Key Rotation");
        $this->info("================================");

        // Build query
        $query = Password::query();

        if ($fromVersion) {
            $query->where('key_version', $fromVersion);
            $this->info("Rotating from key version: {$fromVersion}");
        } else {
            // Find all passwords that need rotation (older versions)
            $query->where('key_version', '<', $toVersion);
            $this->info("Rotating all passwords with older key versions");
        }

        $this->info("Target key version: {$toVersion}");

        $totalCount = $query->count();

        if ($totalCount === 0) {
            $this->info("No passwords need key rotation.");
            return 0;
        }

        $this->info("Found {$totalCount} passwords to rotate.");

        if ($dryRun) {
            $this->warn("DRY RUN MODE - No changes will be made");
            return 0;
        }

        if (!$this->confirm("Proceed with key rotation?")) {
            $this->info("Key rotation cancelled.");
            return 0;
        }

        $progressBar = $this->output->createProgressBar($totalCount);
        $progressBar->start();

        $processed = 0;
        $errors = 0;

        // Process in batches
        $query->chunk($batchSize, function ($passwords) use (&$processed, &$errors, $progressBar, $toVersion) {
            DB::transaction(function () use ($passwords, &$processed, &$errors, $progressBar, $toVersion) {
                foreach ($passwords as $password) {
                    try {
                        $this->rotatePasswordKey($password, $toVersion);
                        $processed++;
                    } catch (\Exception $e) {
                        $errors++;
                        $this->newLine();
                        $this->error("Failed to rotate password {$password->id}: {$e->getMessage()}");
                    }

                    $progressBar->advance();
                }
            });
        });

        $progressBar->finish();
        $this->newLine();

        $this->info("Key rotation completed!");
        $this->info("Processed: {$processed}");

        if ($errors > 0) {
            $this->warn("Errors: {$errors}");
            return 1;
        }

        return 0;
    }

    /**
     * Rotate encryption key for a single password
     */
    protected function rotatePasswordKey(Password $password, int $toVersion): void
    {
        // Get the current encrypted password directly from database
        $passwordRecord = DB::table('passwords')->where('id', $password->id)->first();
        $currentEncryptedPassword = $passwordRecord->password;

        // Re-encrypt with new key version
        $encrypted = $this->encryptionService->reEncrypt(
            $currentEncryptedPassword,
            $passwordRecord->encrypted_key,
            $passwordRecord->key_version,
            $toVersion
        );

        // Update database directly to avoid model accessor/mutator issues
        DB::table('passwords')->where('id', $password->id)->update([
            'password' => $encrypted['encrypted_data'],
            'encrypted_key' => $encrypted['encrypted_key'],
            'key_version' => $encrypted['key_version'],
            'updated_at' => now(),
        ]);
    }
}
