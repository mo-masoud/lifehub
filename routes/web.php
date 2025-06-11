<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FolderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::put('folders/bulk-update', [FolderController::class, 'bulkUpdate'])->name('folders.bulk-update');
    Route::delete('folders/bulk-destroy', [FolderController::class, 'bulkDestroy'])->name('folders.bulk-destroy');

    Route::resource('folders', FolderController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/passwords.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
