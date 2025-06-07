<?php

namespace Database\Factories;

use App\Enums\PasswordTypes;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Password>
 */
class PasswordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create()->id,
            'type' => $this->faker->randomElement(PasswordTypes::cases()),
            'name' => $this->faker->unique()->word(),
            'username' => $this->faker->userName(),
            'password' => 'temp_password', // Temporary value, will be replaced
            'url' => $this->faker->url(),
            'notes' => $this->faker->optional()->paragraph(),
            'folder_id' => $this->faker->optional()->passthrough(Folder::factory()->create()->id),
            'copied' => $this->faker->numberBetween(0, 100),
            'last_used_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
            'expires_at' => $this->faker->optional()->dateTimeBetween('-1 year', '+1 year'),
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function ($password) {
            // Generate a random password and encrypt it
            $plainPassword = $this->faker->password();
            $encryptionService = app(\App\Services\EnvelopeEncryptionService::class);
            $encrypted = $encryptionService->encrypt($plainPassword);

            // Update database directly to bypass model mutator
            DB::table('passwords')->where('id', $password->id)->update([
                'password' => $encrypted['encrypted_data'],
                'encrypted_key' => $encrypted['encrypted_key'],
                'key_version' => $encrypted['key_version'],
            ]);

            // Update model attributes to reflect database state
            $password->setRawAttributes(array_merge($password->getAttributes(), [
                'password' => $encrypted['encrypted_data'],
                'encrypted_key' => $encrypted['encrypted_key'],
                'key_version' => $encrypted['key_version'],
            ]));
        });
    }

    /**
     * Create a password with a specific key version
     */
    public function withKeyVersion(int $version): static
    {
        return $this->afterCreating(function ($password) use ($version) {
            $encryptionService = app(\App\Services\EnvelopeEncryptionService::class);

            // Generate a random password and encrypt it with the specified version
            $plainPassword = $this->faker->password();
            $encrypted = $encryptionService->encrypt($plainPassword, $version);

            // Update database directly to bypass model mutator
            DB::table('passwords')->where('id', $password->id)->update([
                'password' => $encrypted['encrypted_data'],
                'encrypted_key' => $encrypted['encrypted_key'],
                'key_version' => $encrypted['key_version'],
            ]);

            // Update model attributes to reflect database state
            $password->setRawAttributes(array_merge($password->getAttributes(), [
                'password' => $encrypted['encrypted_data'],
                'encrypted_key' => $encrypted['encrypted_key'],
                'key_version' => $encrypted['key_version'],
            ]));
        });
    }

    /**
     * Create a password with a specific plain password
     */
    public function withPlainPassword(string $plainPassword, ?int $keyVersion = null): static
    {
        return $this->afterCreating(function ($password) use ($plainPassword, $keyVersion) {
            $encryptionService = app(\App\Services\EnvelopeEncryptionService::class);
            $encrypted = $encryptionService->encrypt($plainPassword, $keyVersion);

            // Update database directly to bypass model mutator
            DB::table('passwords')->where('id', $password->id)->update([
                'password' => $encrypted['encrypted_data'],
                'encrypted_key' => $encrypted['encrypted_key'],
                'key_version' => $encrypted['key_version'],
            ]);

            // Update model attributes to reflect database state
            $password->setRawAttributes(array_merge($password->getAttributes(), [
                'password' => $encrypted['encrypted_data'],
                'encrypted_key' => $encrypted['encrypted_key'],
                'key_version' => $encrypted['key_version'],
            ]));
        });
    }
}
