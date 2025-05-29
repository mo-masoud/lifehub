<?php

namespace App\Providers;

use App\Models\Password;
use App\Models\Snapshot;
use App\Models\SSH;
use App\Observers\PasswordObserver;
use App\Observers\SnapshotObserver;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure morph map for CopyLog polymorphic relationships
        Relation::morphMap([
            'password' => Password::class,
            'ssh' => SSH::class,
        ]);

        // Register observers
        Password::observe(PasswordObserver::class);
        Snapshot::observe(SnapshotObserver::class);
    }
}
