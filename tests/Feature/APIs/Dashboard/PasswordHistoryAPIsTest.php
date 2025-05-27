<?php

use App\Models\Password;
use App\Models\PasswordHistory;
use App\Models\User;

describe('Password History APIs', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user, 'sanctum');
    });

    it('can retrieve password history for owned password', function () {
        // Create a password for the authenticated user
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Password',
            'password' => 'current_password',
        ]);

        // Create some password history entries
        PasswordHistory::create([
            'password_id' => $password->id,
            'old_password' => 'old_password_1',
            'changed_at' => now()->subDays(2),
        ]);

        PasswordHistory::create([
            'password_id' => $password->id,
            'old_password' => 'old_password_2',
            'changed_at' => now()->subDays(1),
        ]);

        $response = $this->getJson("/api/dashboard/passwords/{$password->id}/history");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'old_password',
                        'changed_at',
                    ],
                ],
                'message',
                'password_name',
            ]);

        expect($response->json('data'))->toHaveCount(2);

        // Verify the passwords are properly decrypted and ordered by most recent first
        $historyData = $response->json('data');
        expect($historyData[0]['old_password'])->toBe('old_password_2'); // Most recent first
        expect($historyData[1]['old_password'])->toBe('old_password_1');
    });

    it('cannot retrieve password history for password owned by another user', function () {
        $otherUser = User::factory()->create();

        $password = Password::factory()->create([
            'user_id' => $otherUser->id,
            'name' => 'Other User Password',
        ]);

        PasswordHistory::create([
            'password_id' => $password->id,
            'old_password' => 'secret_password',
            'changed_at' => now(),
        ]);

        $response = $this->getJson("/api/dashboard/passwords/{$password->id}/history");

        $response->assertStatus(403);
    });

    it('returns empty array when password has no history', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'New Password',
        ]);

        $response = $this->getJson("/api/dashboard/passwords/{$password->id}/history");

        $response->assertStatus(200)
            ->assertJson(['data' => []]);
    });

    it('returns 404 for non-existent password', function () {
        $response = $this->getJson('/api/dashboard/passwords/999/history');

        $response->assertStatus(404);
    });

    it('automatically tracks password changes', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'password' => 'original_password',
        ]);

        expect($password->passwordHistories)->toHaveCount(0);

        // Update the password
        $password->update(['password' => 'new_password']);

        $password->refresh();
        expect($password->passwordHistories)->toHaveCount(1);

        $history = $password->passwordHistories->first();
        expect($history->old_password)->toBe('original_password');
        expect($history->changed_at)->toBeInstanceOf(Carbon\Carbon::class);
    });

    it('tracks multiple password changes and orders them properly', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'password' => 'password_v1',
        ]);

        // Manually create password history entries with specific timestamps
        PasswordHistory::create([
            'password_id' => $password->id,
            'old_password' => 'password_v1',
            'changed_at' => now()->subMinutes(3),
        ]);

        PasswordHistory::create([
            'password_id' => $password->id,
            'old_password' => 'password_v2',
            'changed_at' => now()->subMinutes(2),
        ]);

        PasswordHistory::create([
            'password_id' => $password->id,
            'old_password' => 'password_v3',
            'changed_at' => now()->subMinutes(1),
        ]);

        $password->refresh();
        expect($password->passwordHistories)->toHaveCount(3);

        // The relationship returns histories in descending order (newest first) by default
        $histories = $password->passwordHistories;
        expect($histories->count())->toBe(3);

        // Verify the passwords are in descending chronological order (newest first)
        expect($histories[0]->old_password)->toBe('password_v3'); // Most recent
        expect($histories[1]->old_password)->toBe('password_v2');
        expect($histories[2]->old_password)->toBe('password_v1'); // Oldest

        // Verify all password histories can be properly decrypted
        foreach ($histories as $history) {
            expect($history->old_password)->toBeString();
            expect(strlen($history->old_password))->toBeGreaterThan(0);
        }
    });

    it('does not create history when other fields are updated', function () {
        $password = Password::factory()->create([
            'user_id' => $this->user->id,
            'password' => 'unchanged_password',
        ]);

        // Update other fields
        $password->update([
            'name' => 'Updated Name',
            'username' => 'updated_username',
            'url' => 'https://updated-url.com',
        ]);

        $password->refresh();
        expect($password->passwordHistories)->toHaveCount(0);
    });
});
