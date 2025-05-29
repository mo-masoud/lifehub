<?php

use App\Jobs\CheckGoalsAchievements;
use App\Models\Snapshot;
use App\Models\User;
use App\Services\CreateSnapshotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('CheckGoalsAchievements job is dispatched when snapshot is created', function () {
    Queue::fake();

    // Create a user
    $user = User::factory()->create();

    // Create a snapshot using the service
    $snapshotService = new CreateSnapshotService();
    $snapshotService->handle($user);

    // Assert that the job was dispatched
    Queue::assertPushed(CheckGoalsAchievements::class, function ($job) use ($user) {
        return $job->user->id === $user->id;
    });
});

test('CheckGoalsAchievements job is dispatched when snapshot is deleted', function () {
    Queue::fake();

    // Create a user and snapshot
    $user = User::factory()->create();
    $snapshot = Snapshot::factory()->create(['user_id' => $user->id]);

    // Delete the snapshot
    $snapshot->delete();

    // Assert that the job was dispatched
    Queue::assertPushed(CheckGoalsAchievements::class, function ($job) use ($user) {
        return $job->user->id === $user->id;
    });
});

test('observer does not dispatch job for update events', function () {
    // Create a user and snapshot without queue faking first
    $user = User::factory()->create();
    $snapshot = Snapshot::factory()->create(['user_id' => $user->id]);

    // Now fake the queue to monitor subsequent operations
    Queue::fake();

    // Update the snapshot (should not trigger job)
    $snapshot->update(['usd_rate' => 50.0]);

    // Assert that no job was dispatched after the update
    Queue::assertNotPushed(CheckGoalsAchievements::class);
});
