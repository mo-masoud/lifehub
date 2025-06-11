<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertStatus(200);
});

test('email can be verified', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});

test('email is not verified with invalid hash', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('email verification notification can be sent', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->post('/email/verification-notification');

    $response->assertRedirect()
        ->assertSessionHas('status', 'verification-link-sent');
});

test('email verification notification redirects if email already verified', function () {
    $user = User::factory()->create(); // Already verified

    $response = $this->actingAs($user)->post('/email/verification-notification');

    $response->assertRedirect(route('dashboard', absolute: false));
});

test('email verification prompt redirects if already verified', function () {
    $user = User::factory()->create(); // Already verified

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertRedirect(route('dashboard', absolute: false));
});

test('verify email controller redirects if already verified', function () {
    $user = User::factory()->create(); // Already verified

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});

test('verify email controller fires verified event when user successfully verifies', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});
