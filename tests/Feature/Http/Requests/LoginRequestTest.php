<?php

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);
});

test('LoginRequest → authorize returns true', function () {
    $request = new LoginRequest();

    expect($request->authorize())->toBeTrue();
});

test('LoginRequest → rules requires email field', function () {
    $data = [];

    $validator = Validator::make($data, (new LoginRequest())->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('email'))->toBeTrue();
});

test('LoginRequest → rules requires password field', function () {
    $data = ['email' => 'test@example.com'];

    $validator = Validator::make($data, (new LoginRequest())->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('password'))->toBeTrue();
});

test('LoginRequest → rules validates email format', function () {
    $data = [
        'email' => 'invalid-email',
        'password' => 'password123',
    ];

    $validator = Validator::make($data, (new LoginRequest())->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('email'))->toBeTrue();
});

test('LoginRequest → rules accepts valid email and password', function () {
    $data = [
        'email' => 'test@example.com',
        'password' => 'password123',
    ];

    $validator = Validator::make($data, (new LoginRequest())->rules());

    expect($validator->passes())->toBeTrue();
});

test('LoginRequest → authenticate succeeds with valid credentials', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $request->authenticate();

    expect(Auth::check())->toBeTrue();
    expect(Auth::user()->email)->toBe('test@example.com');
});

test('LoginRequest → authenticate fails with invalid credentials', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ]);

    expect(fn() => $request->authenticate())->toThrow(ValidationException::class);
    expect(Auth::check())->toBeFalse();
});

test('LoginRequest → authenticate handles remember me option', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => 'password123',
        'remember' => true,
    ]);

    $request->authenticate();

    expect(Auth::check())->toBeTrue();
    expect(Auth::viaRemember())->toBeFalse(); // Not via remember since it was just logged in
});

test('LoginRequest → throttleKey generates correct format', function () {
    $request = new LoginRequest();
    $request->merge(['email' => 'Test@Example.com']);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    $throttleKey = $request->throttleKey();

    expect($throttleKey)->toBe('test@example.com|192.168.1.1');
});

test('LoginRequest → throttleKey handles special characters in email', function () {
    $request = new LoginRequest();
    $request->merge(['email' => 'tëst@éxample.com']);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    $throttleKey = $request->throttleKey();

    expect($throttleKey)->toBe('test@example.com|192.168.1.1');
});

test('LoginRequest → ensureIsNotRateLimited allows under limit', function () {
    $request = new LoginRequest();
    $request->merge(['email' => 'test@example.com']);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    // Should not throw any exception
    $request->ensureIsNotRateLimited();

    expect(true)->toBeTrue(); // Test passes if no exception is thrown
});

test('LoginRequest → ensureIsNotRateLimited blocks after exceeding limit', function () {
    Event::fake();

    $request = new LoginRequest();
    $request->merge(['email' => 'test@example.com']);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    $throttleKey = $request->throttleKey();

    // Simulate 5 failed attempts
    for ($i = 0; $i < 5; $i++) {
        RateLimiter::hit($throttleKey);
    }

    expect(fn() => $request->ensureIsNotRateLimited())->toThrow(ValidationException::class);

    Event::assertDispatched(Lockout::class);
});

test('LoginRequest → authenticate increments rate limiter on failure', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ]);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    $throttleKey = $request->throttleKey();

    // Ensure we start with 0 attempts
    RateLimiter::clear($throttleKey);

    try {
        $request->authenticate();
    } catch (ValidationException $e) {
        // Expected
    }

    expect(RateLimiter::attempts($throttleKey))->toBe(1);
});

test('LoginRequest → authenticate clears rate limiter on success', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    $throttleKey = $request->throttleKey();

    // Add some failed attempts first
    RateLimiter::hit($throttleKey);
    RateLimiter::hit($throttleKey);

    expect(RateLimiter::attempts($throttleKey))->toBe(2);

    $request->authenticate();

    expect(RateLimiter::attempts($throttleKey))->toBe(0);
});

test('LoginRequest → authenticate validates email field in exception', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ]);

    try {
        $request->authenticate();
        expect(false)->toBeTrue(); // Should not reach here
    } catch (ValidationException $e) {
        expect($e->errors())->toHaveKey('email');
        expect($e->errors()['email'][0])->toBe(__('auth.failed'));
    }
});

test('LoginRequest → ensureIsNotRateLimited provides throttle message with time', function () {
    Event::fake();

    $request = new LoginRequest();
    $request->merge(['email' => 'test@example.com']);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    $throttleKey = $request->throttleKey();

    // Simulate 5 failed attempts
    for ($i = 0; $i < 5; $i++) {
        RateLimiter::hit($throttleKey);
    }

    try {
        $request->ensureIsNotRateLimited();
        expect(false)->toBeTrue(); // Should not reach here
    } catch (ValidationException $e) {
        expect($e->errors())->toHaveKey('email');
        expect($e->errors()['email'][0])->toContain('Too many login attempts');
    }
});

test('LoginRequest → handles empty string email gracefully', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => '',
        'password' => 'password123',
    ]);

    $data = ['email' => '', 'password' => 'password123'];
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('email'))->toBeTrue();
});

test('LoginRequest → handles null password gracefully', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => null,
    ]);

    $data = ['email' => 'test@example.com', 'password' => null];
    $validator = Validator::make($data, $request->rules());

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('password'))->toBeTrue();
});

test('LoginRequest → boolean remember parameter works correctly', function () {
    $request = new LoginRequest();
    $request->merge([
        'email' => 'test@example.com',
        'password' => 'password123',
        'remember' => '1', // String that should be converted to boolean
    ]);

    expect($request->boolean('remember'))->toBeTrue();

    $request->merge(['remember' => '0']);
    expect($request->boolean('remember'))->toBeFalse();

    $request->merge(['remember' => null]);
    expect($request->boolean('remember'))->toBeFalse();
});
