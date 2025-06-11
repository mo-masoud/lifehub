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
        $neverUsedPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => null,
        ]);

        $recentPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) use ($recentPassword) {
                $page->component('dashboard')
                    ->has('recentPasswords', 1)
                    ->where('recentPasswords.0.id', $recentPassword->id);
            });
    });

    test('index returns expiring passwords data', function () {
        // Create passwords with different expiry dates
        $normalPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(30),
        ]);

        $expiringPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(2), // Expires within 3 days
        ]);

        $expiredPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->subDay(), // Already expired
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) use ($expiringPassword) {
                $page->component('dashboard')
                    ->has('expiringPasswords', 1)
                    ->where('expiringPasswords.0.id', $expiringPassword->id);
            });
    });

    test('index limits recent passwords to 5', function () {
        // Create 7 passwords
        $passwords = Password::factory()->count(7)->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subMinutes(rand(1, 60)),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) {
                $page->component('dashboard')
                    ->has('recentPasswords', 5);
            });
    });

    test('index limits expiring passwords to 5', function () {
        // Create 7 expiring passwords
        Password::factory()->count(7)->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(1),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) {
                $page->component('dashboard')
                    ->has('expiringPasswords', 5);
            });
    });

    test('index sorts expiring passwords by expiry date ascending', function () {
        $laterExpiring = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(3),
        ]);

        $soonExpiring = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(1),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) use ($soonExpiring, $laterExpiring) {
                $page->component('dashboard')
                    ->has('expiringPasswords', 2)
                    ->where('expiringPasswords.0.id', $soonExpiring->id)
                    ->where('expiringPasswords.1.id', $laterExpiring->id);
            });
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
                fn ($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords', 1)
                    ->where('recentPasswords.0.id', $userPassword->id)
            );
    });

    test('index handles users with no passwords', function () {
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) {
                $page->component('dashboard')
                    ->has('recentPasswords', 0)
                    ->has('expiringPasswords', 0)
                    ->has('expiredPasswords', 0);
            });
    });

    test('index hides expiring passwords section when empty', function () {
        // Create only a recent password, no expiring passwords
        Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30), // Not expiring soon
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) {
                $page->component('dashboard')
                    ->has('recentPasswords', 1)
                    ->has('expiringPasswords', 0)
                    ->has('expiredPasswords', 0);
            });
    });

    test('index hides expired passwords section when empty', function () {
        // Create only a recent password, no expired passwords
        Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
            'expires_at' => now()->addDays(10), // Expiring but not expired
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) {
                $page->component('dashboard')
                    ->has('recentPasswords', 1)
                    ->has('expiringPasswords', 1)
                    ->has('expiredPasswords', 0);
            });
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
                fn ($page) => $page
                    ->component('dashboard')
                    ->has('recentPasswords', 3)
                    ->where('recentPasswords.0.id', $lastUsed->id)
                    ->where('recentPasswords.1.id', $middleUsed->id)
                    ->where('recentPasswords.2.id', $firstUsed->id)
            );
    });

    test('index excludes passwords with null last_used_at from recent passwords', function () {
        $usedPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now(),
        ]);

        $neverUsedPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => null,
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) use ($usedPassword) {
                $page->component('dashboard')
                    ->has('recentPasswords', 1)
                    ->where('recentPasswords.0.id', $usedPassword->id);
            });
    });

    test('index returns expired passwords data', function () {
        // Create passwords with different expiry states
        $normalPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->addDays(30),
        ]);

        $expiredPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->subDays(5), // Expired 5 days ago
        ]);

        $oldExpiredPassword = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->subDays(40), // Expired too long ago
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) use ($expiredPassword) {
                $page->component('dashboard')
                    ->has('expiredPasswords', 1)
                    ->where('expiredPasswords.0.id', $expiredPassword->id);
            });
    });

    test('index limits expired passwords to 5', function () {
        // Create 7 expired passwords
        Password::factory()->count(7)->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->subDays(rand(1, 20)),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) {
                $page->component('dashboard')
                    ->has('expiredPasswords', 5);
            });
    });

    test('index sorts expired passwords by expiry date descending', function () {
        $olderExpired = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->subDays(20),
        ]);

        $newerExpired = Password::factory()->create([
            'user_id' => $this->user->id,
            'expires_at' => now()->subDays(5),
        ]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertSuccessful()
            ->assertInertia(function ($page) use ($newerExpired, $olderExpired) {
                $page->component('dashboard')
                    ->has('expiredPasswords', 2)
                    ->where('expiredPasswords.0.id', $newerExpired->id)
                    ->where('expiredPasswords.1.id', $olderExpired->id);
            });
    });
});
