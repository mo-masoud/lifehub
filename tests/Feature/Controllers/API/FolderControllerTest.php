<?php

use App\Models\Folder;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('can get folders as json', function () {
    $folders = Folder::factory()->count(3)->create(['user_id' => $this->user->id]);

    $response = $this->getJson(route('api.v1.folders.index'));

    $response->assertOk()
        ->assertJsonCount(3)
        ->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'featured',
                'created_at',
                'updated_at',
            ]
        ]);
});

it('returns folders in correct order', function () {
    $folderA = Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'A Folder']);
    $folderZ = Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Z Folder']);

    $response = $this->getJson(route('api.v1.folders.index'));

    $response->assertOk();

    $folders = $response->json();
    // Should be ordered by the default ordering (ordered scope)
    expect($folders)->toHaveCount(2);
});

it('only returns folders belonging to authenticated user', function () {
    $otherUser = User::factory()->create();

    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'My Folder']);
    Folder::factory()->create(['user_id' => $otherUser->id, 'name' => 'Other Folder']);

    $response = $this->getJson(route('api.v1.folders.index'));

    $response->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.name', 'My Folder');
});

it('can create folder via api', function () {
    $data = [
        'name' => 'API Created Folder',
        'featured' => true,
    ];

    $response = $this->postJson(route('api.v1.folders.store'), $data);

    $response->assertCreated()
        ->assertJsonStructure([
            'success',
            'folder' => [
                'id',
                'name',
                'featured',
                'created_at',
                'updated_at',
            ]
        ])
        ->assertJsonPath('success', 'Folder created successfully')
        ->assertJsonPath('folder.name', 'API Created Folder')
        ->assertJsonPath('folder.featured', true);

    $this->assertDatabaseHas('folders', [
        'user_id' => $this->user->id,
        'name' => 'API Created Folder',
        'featured' => true,
    ]);
});

it('validates folder creation data in api', function () {
    $response = $this->postJson(route('api.v1.folders.store'), [
        'name' => '', // Empty name should fail
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('prevents creating duplicate folder names via api', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Existing Folder']);

    $response = $this->postJson(route('api.v1.folders.store'), [
        'name' => 'Existing Folder',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('requires authentication for api endpoints', function () {
    auth()->logout();

    $this->getJson(route('api.v1.folders.index'))
        ->assertUnauthorized();

    $this->postJson(route('api.v1.folders.store'), ['name' => 'Test'])
        ->assertUnauthorized();
});
