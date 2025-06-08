<?php

use App\Models\Folder;
use App\Models\User;
use App\Services\FolderService;
use Illuminate\Database\Eloquent\Collection;

beforeEach(function () {
    $this->service = app(FolderService::class);
    $this->user = User::factory()->create();
});

it('can create a folder for a user', function () {
    $data = [
        'name' => 'Test Folder',
        'featured' => true,
    ];

    $folder = $this->service->createFolder($this->user, $data);

    expect($folder)->toBeInstanceOf(Folder::class)
        ->and($folder->name)->toBe('Test Folder')
        ->and($folder->featured)->toBe(true)
        ->and($folder->user_id)->toBe($this->user->id);
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

    $updatedFolder = $this->service->updateFolder($folder, $data);

    expect($updatedFolder->name)->toBe('Updated Name')
        ->and($updatedFolder->featured)->toBe(true);
});

it('can delete a folder', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);

    $result = $this->service->deleteFolder($folder);

    expect($result)->toBe(true);
    $this->assertDatabaseMissing('folders', ['id' => $folder->id]);
});

it('can bulk update folders featured status', function () {
    $folders = Folder::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'featured' => false,
    ]);

    $folderIds = $folders->pluck('id')->toArray();

    $updated = $this->service->bulkUpdateFolders($this->user, $folderIds, ['featured' => true]);

    expect($updated)->toBe(3);
    $this->user->folders()->whereIn('id', $folderIds)->get()->each(function ($folder) {
        expect($folder->featured)->toBe(true);
    });
});

it('throws exception when bulk updating non-existent folders', function () {
    $this->service->bulkUpdateFolders($this->user, [999], ['featured' => true]);
})->throws(InvalidArgumentException::class, 'Some folders were not found or do not belong to the user.');

it('can bulk delete folders', function () {
    $folders = Folder::factory()->count(3)->create(['user_id' => $this->user->id]);
    $folderIds = $folders->pluck('id')->toArray();

    $deleted = $this->service->bulkDeleteFolders($this->user, $folderIds);

    expect($deleted)->toBe(3);
    foreach ($folderIds as $folderId) {
        $this->assertDatabaseMissing('folders', ['id' => $folderId]);
    }
});

it('throws exception when bulk deleting non-existent folders', function () {
    $this->service->bulkDeleteFolders($this->user, [999]);
})->throws(InvalidArgumentException::class, 'Some folders were not found or do not belong to the user.');

it('can get folders with search filter', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Work Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Personal Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Other']);

    $filters = ['search' => 'Folder'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->count())->toBe(2);
});

it('can get folders with featured filter showing only featured', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => true]);
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => true]);
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => false]);

    $filters = ['featured' => 'featured'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->count())->toBe(2);
    $result->each(function ($folder) {
        expect($folder->featured)->toBe(true);
    });
});

it('can get folders with featured filter showing only not featured', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => true]);
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => false]);
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => false]);

    $filters = ['featured' => 'not_featured'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->count())->toBe(2);
    $result->each(function ($folder) {
        expect($folder->featured)->toBe(false);
    });
});

it('can get folders with featured filter showing all', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => true]);
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => false]);

    $filters = ['featured' => 'all'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->count())->toBe(2);
});

it('can get folders with sorting by name ascending', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Z Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'A Folder']);

    $filters = ['sort' => 'name', 'direction' => 'asc'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->first()->name)->toBe('A Folder')
        ->and($result->last()->name)->toBe('Z Folder');
});

it('can get folders with sorting by name descending', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'A Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Z Folder']);

    $filters = ['sort' => 'name', 'direction' => 'desc'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->first()->name)->toBe('Z Folder')
        ->and($result->last()->name)->toBe('A Folder');
});

it('uses default ordering when no sort specified', function () {
    $folder1 = Folder::factory()->create(['user_id' => $this->user->id]);
    $folder2 = Folder::factory()->create(['user_id' => $this->user->id]);

    $result = $this->service->getFolders($this->user, []);

    expect($result->count())->toBe(2);
    // Default ordering should be applied (ordered scope)
});

it('can get folders with pagination', function () {
    Folder::factory()->count(15)->create(['user_id' => $this->user->id]);

    $filters = ['per_page' => 10];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->perPage())->toBe(10)
        ->and($result->total())->toBe(15)
        ->and($result->count())->toBe(10);
});

it('only returns folders belonging to the user', function () {
    $otherUser = User::factory()->create();

    Folder::factory()->create(['user_id' => $this->user->id]);
    Folder::factory()->create(['user_id' => $otherUser->id]);

    $result = $this->service->getFolders($this->user, []);

    expect($result->count())->toBe(1);
});

it('can get folders collection without pagination', function () {
    Folder::factory()->count(15)->create(['user_id' => $this->user->id]);

    $result = $this->service->getFolders($this->user, []);

    expect($result)->toBeInstanceOf(Collection::class)
        ->and($result->count())->toBe(15);
});

it('can filter folders collection by search', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Work Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Personal Folder']);
    Folder::factory()->create(['user_id' => $this->user->id, 'name' => 'Other']);

    $filters = ['search' => 'Folder'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->count())->toBe(2);
});

it('can filter folders collection by featured status', function () {
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => true]);
    Folder::factory()->create(['user_id' => $this->user->id, 'featured' => false]);

    $filters = ['featured' => 'featured'];
    $result = $this->service->getFolders($this->user, $filters);

    expect($result->count())->toBe(1)
        ->and($result->first()->featured)->toBe(true);
});
