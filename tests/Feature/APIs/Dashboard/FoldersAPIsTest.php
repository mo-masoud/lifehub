<?php

use App\Models\Folder;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Folders API', function () {
    it('can fetch user folders', function () {
        // Create folders for the user
        Folder::factory()->count(3)->create(['user_id' => $this->user->id]);

        // Create folders for other users (should not be returned)
        Folder::factory()->count(2)->create();

        $response = $this->actingAs($this->user)
            ->getJson(route('api.dashboard.folders.index'));

        $response->assertOk()
            ->assertJsonCount(3);
    });

    it('can create a new folder', function () {
        $folderData = [
            'name' => 'Test Folder',
        ];

        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.folders.store'), $folderData);

        $response->assertOk()
            ->assertJsonFragment([
                'name' => 'Test Folder',
            ]);

        $this->assertDatabaseHas('folders', [
            'name' => 'Test Folder',
            'user_id' => $this->user->id,
        ]);
    });

    it('validates required fields when creating', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.folders.store'), []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('prevents creating duplicate folder names for same user', function () {
        Folder::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Existing Folder',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.folders.store'), [
                'name' => 'Existing Folder',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('allows same folder name for different users', function () {
        $otherUser = User::factory()->create();
        Folder::factory()->create([
            'user_id' => $otherUser->id,
            'name' => 'Shared Name',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.folders.store'), [
                'name' => 'Shared Name',
            ]);

        $response->assertOk();
    });

    it('requires authentication', function () {
        $response = $this->getJson(route('api.dashboard.folders.index'));
        $response->assertUnauthorized();

        $response = $this->postJson(route('api.dashboard.folders.store'), [
            'name' => 'Test',
        ]);
        $response->assertUnauthorized();
    });
});
