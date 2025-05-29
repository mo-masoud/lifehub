<?php

namespace App\Observers;

use App\Jobs\CheckGoalsAchievements;
use App\Models\Snapshot;

class SnapshotObserver
{
    /**
     * Handle the Snapshot "created" event.
     */
    public function created(Snapshot $snapshot): void
    {
        // Dispatch job to check goals achievements after snapshot creation
        CheckGoalsAchievements::dispatch($snapshot->user);
    }

    /**
     * Handle the Snapshot "updated" event.
     */
    public function updated(Snapshot $snapshot): void
    {
        //
    }

    /**
     * Handle the Snapshot "deleted" event.
     */
    public function deleted(Snapshot $snapshot): void
    {
        // Dispatch job to check goals achievements after snapshot deletion
        CheckGoalsAchievements::dispatch($snapshot->user);
    }

    /**
     * Handle the Snapshot "restored" event.
     */
    public function restored(Snapshot $snapshot): void
    {
        //
    }

    /**
     * Handle the Snapshot "force deleted" event.
     */
    public function forceDeleted(Snapshot $snapshot): void
    {
        //
    }
}
