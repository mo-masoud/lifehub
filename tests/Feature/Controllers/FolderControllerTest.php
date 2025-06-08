<?php

use App\Models\Folder;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('can view folders index page', function () {
    $folders = Folder::factory()->count(3)->create(['user_id' => $this->user->id]);

    $response = $this->get(route('folders.index'));

    $response->assertOk()
        ->assertInertia(function ($page) use ($folders) {
            $page->component('folders/index')
                ->has('folders.data', 3)
                ->has('filters');
        });
});

it('can filter folders by search', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Work Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Personal Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Other']);

    $response = $this->get(route('folders.index', ['search' => 'Folder']));

    $response->assertOk()
        ->assertInertia(function ($page) {
            $page->component('folders/index')
                ->has('folders.data', 2);
        });
});

it('can filter folders by featured status', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => true]);
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => false]);

    $response = $this->get(route('folders.index', ['featured' => 'featured']));

    $response->assertOk()
        ->assertInertia(function ($page) {
            $page->component('folders/index')
                ->has('folders.data', 1)
                ->where('folders.data.0.featured', true);
        });
});

it('can create a folder', function () {
    $data = [
        'name' => 'New Folder',
        'featured' => true,
    ];

    $response = $this->post(route('folders.store'), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Folder created successfully.');

    $this->assertDatabaseHas('folders', [
        'user_id' => $this->user->id,
        'name' => 'New Folder',
        'featured' => true,
    ]);
});

it('can update a folder', function () {
    $folder = Folder::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Original Name',
        'featured' => false,
    ]);

    $data = [
        'name' => 'Updated Name',
        'featured' => true,
    ];

    $response = $this->put(route('folders.update', $folder), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Folder updated successfully.');

    $this->assertDatabaseHas('folders', [
        'id' => $folder->id,
        'name' => 'Updated Name',
        'featured' => true,
    ]);
});

it('can delete a folder', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);

    $response = $this->delete(route('folders.destroy', $folder));

    $response->assertRedirect()
        ->assertSessionHas('success', 'Folder deleted successfully.');

    $this->assertDatabaseMissing('folders', ['id' => $folder->id]);
});

it('can bulk update folders featured status', function () {
    $folders = Folder::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'featured' => false,
    ]);

    $data = [
        'folder_ids' => $folders->pluck('id')->toArray(),
        'featured' => true,
    ];

    $response = $this->put(route('folders.bulk-update'), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', '3 folders added to featured.');

    $folders->each(function ($folder) {
        $this->assertDatabaseHas('folders', [
            'id' => $folder->id,
            'featured' => true,
        ]);
    });
});

it('can bulk delete folders', function () {
    $folders = Folder::factory()->count(3)->create(['user_id' => $this->user->id]);

    $data = [
        'folder_ids' => $folders->pluck('id')->toArray(),
    ];

    $response = $this->delete(route('folders.bulk-destroy'), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', '3 folders deleted successfully.');

    $folders->each(function ($folder) {
        $this->assertDatabaseMissing('folders', ['id' => $folder->id]);
    });
});

it('prevents unauthorized access to other users folders', function () {
    $otherUser = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->put(route('folders.update', $folder), [
        'name' => 'Hacked Name',
        'featured' => true,
    ]);

    $response->assertForbidden();
});

it('validates folder creation data', function () {
    $response = $this->post(route('folders.store'), [
        'name' => '', // Empty name should fail
    ]);

    $response->assertSessionHasErrors(['name']);
});

it('validates folder update data', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);

    $response = $this->put(route('folders.update', $folder), [
        'name' => '', // Empty name should fail
    ]);

    $response->assertSessionHasErrors(['name']);
});

it('validates bulk operations data', function () {
    $response = $this->put(route('folders.bulk-update'), [
        'folder_ids' => [], // Empty array should fail
        'featured' => true,
    ]);

    $response->assertSessionHasErrors(['folder_ids']);
});

it('sorts folders correctly', function () {
    $folderA = Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'A Folder']);
    $folderZ = Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Z Folder']);

    $response = $this->get(route('folders.index', ['sort' => 'name', 'direction' => 'asc']));

    $response->assertOk()
        ->assertInertia(function ($page) use ($folderA, $folderZ) {
            $page->component('folders/index')
                ->where('folders.data.0.name', 'A Folder')
                ->where('folders.data.1.name', 'Z Folder');
        });
});
