<?php

use App\Http\Requests\Passwords\UpdatePasswordRequest;
use App\Models\Folder;
use App\Models\Password;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->password = Password::factory()->create(['user_id' => $this->user->id]);
    $this->actingAs($this->user);
});

test('UpdatePasswordRequest → authorize returns true when user can update password', function () {
    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    expect($request->authorize())->toBeTrue();
});

test('UpdatePasswordRequest → authorize returns false when user cannot update password', function () {
    $otherUser = User::factory()->create();
    $otherPassword = Password::factory()->create(['user_id' => $otherUser->id]);

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($otherPassword) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    expect($request->authorize())->toBeFalse();
});

test('UpdatePasswordRequest → rules requires name field', function () {
    $data = [];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('name'))->toBeTrue();
});

test('UpdatePasswordRequest → rules requires type field', function () {
    $data = ['name' => 'Test Password'];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('type'))->toBeTrue();
});

test('UpdatePasswordRequest → rules requires password field', function () {
    $data = ['name' => 'Test Password', 'type' => 'normal'];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('password'))->toBeTrue();
});

test('UpdatePasswordRequest → rules requires username for normal type', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'password' => 'secret123',
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('username'))->toBeTrue();
});

test('UpdatePasswordRequest → rules does not require username for ssh type', function () {
    $data = [
        'name' => 'Test SSH',
        'type' => 'ssh',
        'password' => 'secret123',
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('UpdatePasswordRequest → rules validates name uniqueness per user excluding current password', function () {
    $existingPassword = Password::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Existing Password',
    ]);

    // Should fail when trying to use another password's name
    $data = [
        'name' => 'Existing Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('name'))->toBeTrue();
});

test('UpdatePasswordRequest → rules allows keeping same name for current password', function () {
    $data = [
        'name' => $this->password->name,
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('UpdatePasswordRequest → rules allows same name from different users', function () {
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

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('UpdatePasswordRequest → rules validates type is valid enum', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'invalid_type',
        'password' => 'secret123',
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('type'))->toBeTrue();
});

test('UpdatePasswordRequest → rules validates folder belongs to user', function () {
    $otherUser = User::factory()->create();
    $folder = Folder::factory()->create(['user_id' => $otherUser->id]);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'folder_id' => $folder->id,
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('folder_id'))->toBeTrue();
});

test('UpdatePasswordRequest → rules validates expires_at is in future', function () {
    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'expires_at' => now()->subDay()->format('Y-m-d'),
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('expires_at'))->toBeTrue();
});

test('UpdatePasswordRequest → rules allows valid folder for user', function () {
    $folder = Folder::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'name' => 'Test Password',
        'type' => 'normal',
        'username' => 'testuser',
        'password' => 'secret123',
        'folder_id' => $folder->id,
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});

test('UpdatePasswordRequest → rules validates all field length limits', function () {
    $data = [
        'name' => str_repeat('a', 256),
        'type' => 'normal',
        'username' => str_repeat('a', 256),
        'password' => str_repeat('a', 256),
        'url' => str_repeat('a', 256),
        'cli' => str_repeat('a', 256),
        'notes' => str_repeat('a', 10001),
    ];

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('name'))->toBeTrue();
    expect($validator->errors()->has('username'))->toBeTrue();
    expect($validator->errors()->has('password'))->toBeTrue();
    expect($validator->errors()->has('url'))->toBeTrue();
    expect($validator->errors()->has('cli'))->toBeTrue();
    expect($validator->errors()->has('notes'))->toBeTrue();
});

test('UpdatePasswordRequest → rules accepts all optional fields as null', function () {
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

    $request = new UpdatePasswordRequest();
    $request->setUserResolver(fn() => $this->user);
    $request->setRouteResolver(fn() => new class($this->password) {
        private Password $password;
        public function __construct(Password $password)
        {
            $this->password = $password;
        }
        public function parameter(string $key)
        {
            return $this->password;
        }
    });

    $validator = Validator::make($data, $request->rules());

    expect($validator->passes())->toBeTrue();
});
