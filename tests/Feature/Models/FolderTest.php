<?php

use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Folder Model', function () {
    test('can create a folder', function () {
        $user = User::factory()->create();

        $folder = Folder::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test Folder',
        ]);

        expect($folder)->toBeInstanceOf(Folder::class)
            ->and($folder->name)->toBe('Test Folder')
            ->and($folder->user_id)->toBe($user->id);
    });

    test('has fillable attributes', function () {
        $folder = new Folder();

        expect($folder->getFillable())->toBe([
            'user_id',
            'name',
        ]);
    });

    test('has correct casts', function () {
        $folder = new Folder();

        expect($folder->getCasts())->toHaveKey('user_id', 'integer');
    });

    test('belongs to a user', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);

        expect($folder->user)->toBeInstanceOf(User::class)
            ->and($folder->user->id)->toBe($user->id);
    });

    test('has many passwords', function () {
        $folder = Folder::factory()->create();

        Password::factory()->count(3)->create(['folder_id' => $folder->id]);

        expect($folder->passwords)->toHaveCount(3)
            ->and($folder->passwords->first())->toBeInstanceOf(Password::class);
    });

    test('folder name is unique per user', function () {
        $user = User::factory()->create();

        Folder::factory()->create([
            'user_id' => $user->id,
            'name' => 'Unique Folder',
        ]);

        expect(function () use ($user) {
            Folder::factory()->create([
                'user_id' => $user->id,
                'name' => 'Unique Folder',
            ]);
        })->toThrow(QueryException::class);
    });

    test('different users can have folders with same name', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $folder1 = Folder::factory()->create([
            'user_id' => $user1->id,
            'name' => 'Same Name',
        ]);

        $folder2 = Folder::factory()->create([
            'user_id' => $user2->id,
            'name' => 'Same Name',
        ]);

        expect($folder1->name)->toBe($folder2->name)
            ->and($folder1->user_id)->not->toBe($folder2->user_id);
    });

    test('is deleted when user is deleted', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);

        expect(Folder::find($folder->id))->not->toBeNull();

        $user->delete();

        expect(Folder::find($folder->id))->toBeNull();
    });

    test('has timestamps', function () {
        $folder = Folder::factory()->create();

        expect($folder->created_at)->not->toBeNull()
            ->and($folder->updated_at)->not->toBeNull();
    });

    test('can be updated', function () {
        $folder = Folder::factory()->create(['name' => 'Original Name']);

        $folder->update(['name' => 'Updated Name']);

        expect($folder->fresh()->name)->toBe('Updated Name');
    });

    test('user_id is required', function () {
        expect(function () {
            Folder::create(['name' => 'Test Folder']);
        })->toThrow(QueryException::class);
    });

    test('name is required', function () {
        $user = User::factory()->create();

        expect(function () use ($user) {
            Folder::create(['user_id' => $user->id]);
        })->toThrow(QueryException::class);
    });

    test('can scope folders by user', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Folder::factory()->count(2)->create(['user_id' => $user1->id]);
        Folder::factory()->count(3)->create(['user_id' => $user2->id]);

        $user1Folders = Folder::where('user_id', $user1->id)->get();
        $user2Folders = Folder::where('user_id', $user2->id)->get();

        expect($user1Folders)->toHaveCount(2)
            ->and($user2Folders)->toHaveCount(3);
    });

    test('passwords are deleted when folder is deleted', function () {
        $folder = Folder::factory()->create();
        $passwords = Password::factory()->count(2)->create(['folder_id' => $folder->id]);

        expect(Password::where('folder_id', $folder->id)->count())->toBe(2);

        $folder->delete();

        expect(Password::where('folder_id', $folder->id)->count())->toBe(0);
    });

    test('can have empty passwords collection', function () {
        $folder = Folder::factory()->create();

        expect($folder->passwords)->toHaveCount(0)
            ->and($folder->passwords)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    test('folder name can contain special characters', function () {
        $user = User::factory()->create();
        $specialName = 'Folder-With_Special@Characters!';

        $folder = Folder::factory()->create([
            'user_id' => $user->id,
            'name' => $specialName,
        ]);

        expect($folder->name)->toBe($specialName);
    });

    test('folder name can be long', function () {
        $user = User::factory()->create();
        $longName = str_repeat('A', 255); // Test maximum string length

        $folder = Folder::factory()->create([
            'user_id' => $user->id,
            'name' => $longName,
        ]);

        expect($folder->name)->toBe($longName);
    });

    test('can retrieve folder with its user and passwords', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);
        Password::factory()->count(2)->create(['folder_id' => $folder->id]);

        $folderWithRelations = Folder::with(['user', 'passwords'])->find($folder->id);

        expect($folderWithRelations->user)->toBeInstanceOf(User::class)
            ->and($folderWithRelations->passwords)->toHaveCount(2);
    });
});
