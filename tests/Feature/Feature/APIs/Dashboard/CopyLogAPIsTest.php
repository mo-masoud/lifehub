<?php

use App\Models\Password;
use App\Models\SSH;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('authenticated user can log password copy', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/dashboard/copy-logs', [
            'copyable_type' => 'password',
            'copyable_id' => $password->id,
            'field' => 'password',
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'copy_log' => [
                'id',
                'user_id',
                'copyable_type',
                'copyable_id',
                'field',
                'copied_at',
            ],
        ]);

    $this->assertDatabaseHas('copy_logs', [
        'user_id' => $this->user->id,
        'copyable_type' => 'password',
        'copyable_id' => $password->id,
        'field' => 'password',
    ]);
});

test('authenticated user can log SSH copy', function () {
    $ssh = SSH::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/dashboard/copy-logs', [
            'copyable_type' => 'ssh',
            'copyable_id' => $ssh->id,
            'field' => 'prompt',
        ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('copy_logs', [
        'user_id' => $this->user->id,
        'copyable_type' => 'ssh',
        'copyable_id' => $ssh->id,
        'field' => 'prompt',
    ]);
});

test('user cannot log copy for password they do not own', function () {
    $otherUser = User::factory()->create();
    $password = Password::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/dashboard/copy-logs', [
            'copyable_type' => 'password',
            'copyable_id' => $password->id,
            'field' => 'password',
        ]);

    $response->assertStatus(403);
});

test('user cannot log copy for SSH they do not own', function () {
    $otherUser = User::factory()->create();
    $ssh = SSH::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/dashboard/copy-logs', [
            'copyable_type' => 'ssh',
            'copyable_id' => $ssh->id,
            'field' => 'username',
        ]);

    $response->assertStatus(403);
});

test('validation fails for invalid copyable type', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/dashboard/copy-logs', [
            'copyable_type' => 'invalid',
            'copyable_id' => 1,
            'field' => 'password',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['copyable_type']);
});

test('validation fails for invalid field for password', function () {
    $password = Password::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/dashboard/copy-logs', [
            'copyable_type' => 'password',
            'copyable_id' => $password->id,
            'field' => 'prompt', // Invalid for password
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['field']);
});

test('validation fails for invalid field for SSH', function () {
    $ssh = SSH::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/dashboard/copy-logs', [
            'copyable_type' => 'ssh',
            'copyable_id' => $ssh->id,
            'field' => 'email', // Invalid for SSH
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['field']);
});

test('unauthenticated user cannot log copy', function () {
    $response = $this->postJson('/api/dashboard/copy-logs', [
        'copyable_type' => 'password',
        'copyable_id' => 1,
        'field' => 'password',
    ]);

    $response->assertStatus(401);
});
