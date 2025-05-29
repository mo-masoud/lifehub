<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckGoalsAchievements implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Load the user's savings goals and check their achievement status
        $savingsGoals = $this->user->savingsGoals()->get();

        foreach ($savingsGoals as $goal) {
            $goal->checkAndUpdateAchievement();
        }
    }
}
