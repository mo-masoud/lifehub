<?php

namespace App\Providers;

use App\Models\Password;
use App\Models\SSH;
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
    }
}
