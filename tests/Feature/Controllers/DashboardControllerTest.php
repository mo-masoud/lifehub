<?php

use App\Models\Password;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('DashboardController', function () {
    test('index requires authentication', function () {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    });

    test('index returns dashboard page with recent passwords data', function () {
        // Create passwords with different last_used_at dates
        $oldPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(10),
        ]);

        $recentPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDay(),
        ]);

        $newestPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords')
                    ->has('recentPasswords', 3)
                    ->where('recentPasswords.0.id', $newestPassword->id)
                    ->where('recentPasswords.1.id', $recentPassword->id)
                    ->where('recentPasswords.2.id', $oldPassword->id)
            );
    });

    test('index limits recent passwords to 5 items', function () {
        // Create 10 passwords to test the limit
        Password::factory()->count(10)->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords', 5)
            );
    });

    test('index only shows passwords owned by authenticated user', function () {
        $otherUser = User::factory()->create();

        $userPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
        ]);

        $otherUserPassword = Password::factory()->create([
            'user_id' => $otherUser->id,
            'last_used_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords', 1)
                    ->where('recentPasswords.0.id', $userPassword->id)
            );
    });

    test('index handles users with no passwords', function () {
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords', 0)
            );
    });

    test('index sorts passwords by last_used_at descending', function () {
        $firstUsed = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(3),
        ]);

        $lastUsed = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
        ]);

        $middleUsed = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords', 3)
                    ->where('recentPasswords.0.id', $lastUsed->id)
                    ->where('recentPasswords.1.id', $middleUsed->id)
                    ->where('recentPasswords.2.id', $firstUsed->id)
            );
    });

    test('index includes passwords with null last_used_at at the end', function () {
        $usedPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
        ]);

        $neverUsedPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => null,
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords', 2)
                    ->where('recentPasswords.0.id', $usedPassword->id)
                    ->where('recentPasswords.1.id', $neverUsedPassword->id)
            );
    });
});
