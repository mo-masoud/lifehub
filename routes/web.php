<?php

use App\Http\Controllers\Shared\LocaleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::put('/locale', LocaleController::class)
    ->name('locale');

require __DIR__.'/dashboard.php';
