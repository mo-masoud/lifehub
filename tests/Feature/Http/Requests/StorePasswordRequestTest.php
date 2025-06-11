<?php

use App\Http\Requests\Passwords\StorePasswordRequest;
use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('StorePasswordRequest → authorize returns true when user can create passwords', function () {
    $this->actingAs($this->user);
    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);

    expect($request->authorize())->toBeTrue();
});

test('StorePasswordRequest → rules requires name field', function () {
    $this->actingAs($this->user);

    $data = [];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('name'))->toBeTrue();
});

test('StorePasswordRequest → rules requires type field', function () {
    $this->actingAs($this->user);

    $data = ['name' => 'Test Password'];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('type'))->toBeTrue();
});

test('StorePasswordRequest → rules requires password field', function () {
    $this->actingAs($this->user);

    $data = ['name' => 'Test Password', 'type' => 'normal'];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('password'))->toBeTrue();
});

test('StorePasswordRequest → rules requires username for normal type', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'password' => 'secret123',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('username'))->toBeTrue();
});

test('StorePasswordRequest → rules does not require username for ssh type', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('StorePasswordRequest → rules validates name uniqueness per user', function () {
    $this->actingAs($this->user);

    Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Existing Password',
    ]);

    $data = [
        'name' => 'Existing Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('name'))->toBeTrue();
});

test('StorePasswordRequest → rules allows same name for different users', function () {
    $this->actingAs($this->user);

    $otherUser = User::factory()->create();
    Password::factory()->create([
        'user_id' => $otherUser->id,
        'name' => 'Same Name',
    ]);

    $data = [
        'name' => 'Same Name',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);

    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('StorePasswordRequest → rules validates type is valid enum', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'invalid_type',
        'password' => 'secret123',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('type'))->toBeTrue();
});

test('StorePasswordRequest → rules validates name max length', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => str_repeat('a', 256),
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('name'))->toBeTrue();
});

test('StorePasswordRequest → rules validates username max length', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => str_repeat('a', 256),
        'password' => 'secret123',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('username'))->toBeTrue();
});

test('StorePasswordRequest → rules validates password max length', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => str_repeat('a', 256),
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('password'))->toBeTrue();
});

test('StorePasswordRequest → rules validates url max length', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'url' => str_repeat('a', 256),
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('url'))->toBeTrue();
});

test('StorePasswordRequest → rules validates cli max length', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
        'cli' => str_repeat('a', 256),
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('cli'))->toBeTrue();
});

test('StorePasswordRequest → rules validates notes max length', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'notes' => str_repeat('a', 10001),
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('notes'))->toBeTrue();
});

test('StorePasswordRequest → rules validates folder belongs to user', function () {
    $this->actingAs($this->user);

    $otherUser = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $otherUser->id]);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'folder_id' => $folder->id,
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('folder_id'))->toBeTrue();
});

test('StorePasswordRequest → rules validates expires_at is in future', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'expires_at' => now()->subDay()->format('Y-m-d'),
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('expires_at'))->toBeTrue();
});

test('StorePasswordRequest → rules allows valid future expires_at', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'expires_at' => now()->addWeek()->format('Y-m-d'),
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('StorePasswordRequest → rules allows valid folder for user', function () {
    $this->actingAs($this->user);

    $folder = Folder::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'folder_id' => $folder->id,
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);

    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('StorePasswordRequest → rules accepts all optional fields as null', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'url' => null,
        'cli' => null,
        'folder_id' => null,
        'expires_at' => null,
        'notes' => null,
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('StorePasswordRequest → rules validates folder_id is integer', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'folder_id' => 'invalid',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('folder_id'))->toBeTrue();
});

test('StorePasswordRequest → rules validates expires_at is valid date', function () {
    $this->actingAs($this->user);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'expires_at' => 'invalid-date',
    ];

    $request = new StorePasswordRequest;
    $request->setUserResolver(fn () => $this->user);
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('expires_at'))->toBeTrue();
});
