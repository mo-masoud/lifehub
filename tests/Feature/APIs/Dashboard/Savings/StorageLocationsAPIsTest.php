<?php

use App\Models\SavingsStorageLocation;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('SavingsStorageLocation API', function () {
    it('can fetch storage locations', function () {
        // Create user locations
        SavingsStorageLocation::factory()->count(2)->create(['user_id' => $this->user->id]);

        // System locations are already seeded (home, bank)
        // Create locations for other users (should not be returned)
        SavingsStorageLocation::factory()->count(2)->create();

        $response = $this->actingAs($this->user)
            ->getJson(route('api.dashboard.savings.storage-locations.index'));

        $response->assertOk()
            ->assertJsonCount(4); // 2 user + 2 system locations
    });

    it('can create a new storage location', function () {
        $locationData = [
            'name' => 'Test Location',
        ];

        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.savings.storage-locations.store'), $locationData);

        $response->assertCreated()
            ->assertJsonFragment([
                'name' => 'Test Location',
            ]);

        $this->assertDatabaseHas('savings_storage_locations', [
            'name' => 'Test Location',
            'user_id' => $this->user->id,
        ]);
    });

    it('validates required fields when creating', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.savings.storage-locations.store'), []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('prevents creating duplicate locations', function () {
        SavingsStorageLocation::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Existing Location',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.savings.storage-locations.store'), [
                'name' => 'Existing Location',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment(['Storage location already exists.']);
    });

    it('requires authentication', function () {
        $response = $this->getJson(route('api.dashboard.savings.storage-locations.index'));
        $response->assertUnauthorized();

        $response = $this->postJson(route('api.dashboard.savings.storage-locations.store'), [
            'name' => 'Test',
        ]);
        $response->assertUnauthorized();
    });
});
