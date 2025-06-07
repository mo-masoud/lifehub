<?php

use App\Http\Controllers\Passwords\PasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::resource('passwords', PasswordController::class)
        ->except(['create', 'show', 'edit']);

    Route::post('passwords/{password}/copy', [PasswordController::class, 'copy'])->name('passwords.copy');
    Route::post('passwords/destroy-bulk', [PasswordController::class, 'destroyBulk'])->name('passwords.destroy-bulk');
});
