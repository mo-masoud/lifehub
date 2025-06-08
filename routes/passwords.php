<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Passwords\PasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::resource('passwords', PasswordController::class)
        ->except(['create', 'show', 'edit']);

    Route::post('passwords/{password}/copy', [PasswordController::class, 'copy'])->name('passwords.copy');
    Route::post('passwords/destroy-bulk', [PasswordController::class, 'destroyBulk'])->name('passwords.destroy-bulk');
    Route::post('passwords/move-to-folder', [PasswordController::class, 'moveToFolder'])->name('passwords.move-to-folder');
    Route::post('passwords/remove-from-folder', [PasswordController::class, 'removeFromFolder'])->name('passwords.remove-from-folder');

    Route::get('passwords/audit-logs', [AuditLogController::class, 'index'])->name('passwords.audit-logs.index');
});
