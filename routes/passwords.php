<?php

use App\Http\Controllers\Passwords\PasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::resource('passwords', PasswordController::class)
        ->except(['create', 'show', 'edit']);
});
