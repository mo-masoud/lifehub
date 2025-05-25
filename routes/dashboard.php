<?php

use App\Http\Controllers\Dashboard\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Dashboard\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Dashboard\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Dashboard\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Dashboard\Auth\NewPasswordController;
use App\Http\Controllers\Dashboard\Auth\PasswordResetLinkController;
use App\Http\Controllers\Dashboard\Auth\RegisteredUserController;
use App\Http\Controllers\Dashboard\Auth\VerifyEmailController;
use App\Http\Controllers\Dashboard\HomeController;
use App\Http\Controllers\Dashboard\PasswordManagerController;
use App\Http\Controllers\Dashboard\Savings\InitialSavingController;
use App\Http\Controllers\Dashboard\Savings\SnapshotController;
use App\Http\Controllers\Dashboard\Savings\StorageLocationController;
use App\Http\Controllers\Dashboard\Savings\TransactionController;
use App\Http\Controllers\Dashboard\Settings\LocaleController;
use App\Http\Controllers\Dashboard\Settings\PasswordController;
use App\Http\Controllers\Dashboard\Settings\ProfileController;
use App\Http\Controllers\Dashboard\Settings\UserSettingController;
use App\Http\Controllers\Dashboard\SSHController;
use App\Http\Controllers\Dashboard\Savings\TransactionCategoryController;
use App\Http\Controllers\Dashboard\SavingsGoalsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('dashboard')->as('dashboard.')->group(function () {

    // authentication routes
    Route::middleware('guest')->group(function () {
        Route::get('register', [RegisteredUserController::class, 'create'])
            ->name('register');

        Route::post('register', [RegisteredUserController::class, 'store']);

        Route::get('login', [AuthenticatedSessionController::class, 'create'])
            ->name('login');

        Route::post('login', [AuthenticatedSessionController::class, 'store']);

        Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
            ->name('password.request');

        Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
            ->name('password.email');

        Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
            ->name('password.reset');

        Route::post('reset-password', [NewPasswordController::class, 'store'])
            ->name('password.store');
    });

    Route::middleware('dashboard.auth')->group(function () {
        Route::get('verify-email', EmailVerificationPromptController::class)
            ->name('verification.notice');

        Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');

        Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('verification.send');

        Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
            ->name('password.confirm');

        Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
            ->name('logout');
    });

    Route::middleware(['dashboard.auth', 'verified'])->group(function () {
        Route::get('/', HomeController::class)->name('home');

        Route::redirect('settings', 'settings/profile');

        Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

        Route::get('settings/appearance', static function () {
            return Inertia::render('dashboard/settings/appearance');
        })->name('appearance');

        Route::get('settings/locale', LocaleController::class)->name('settings.locale');

        Route::patch('settings/savings/rate-fallback', [UserSettingController::class, 'updateRateFallback'])->name('settings.savings.rate-fallback.update');

        Route::resource('passwords', PasswordManagerController::class)
            ->only(['index', 'store', 'destroy', 'update']);

        Route::resource('sshs', SSHController::class)
            ->only(['index', 'store', 'destroy', 'update'])
            ->parameters(['sshs' => 'ssh']);

        Route::resource('savings/initial', InitialSavingController::class)
            ->only(['store', 'destroy', 'update'])
            ->names('savings.initial')
            ->parameters(['initial' => 'initialSaving']);

        Route::post('savings/initial/complete', [InitialSavingController::class, 'complete'])
            ->name('savings.initial.complete');

        Route::resource('savings/snapshots', SnapshotController::class)
            ->only(['index', 'store', 'destroy'])
            ->names('savings.snapshots');

        Route::resource('savings/transactions', TransactionController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('savings.transactions');

        Route::resource('savings/storage-locations', StorageLocationController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('savings.storage-locations');

        Route::resource('savings/transaction-categories', TransactionCategoryController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('savings.transaction-categories');

        Route::resource('savings/goals', SavingsGoalsController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('savings.goals');

        Route::post('savings/goals/{savingsGoal}/mark-achieved', [SavingsGoalsController::class, 'markAsAchieved'])
            ->name('savings.goals.mark-achieved');

        Route::post('savings/goals/{savingsGoal}/dismiss-notification', [SavingsGoalsController::class, 'dismissSuccessNotification'])
            ->name('savings.goals.dismiss-notification');

        Route::get('api/savings/goals', [SavingsGoalsController::class, 'apiIndex'])
            ->name('api.savings.goals.index');
    });
});
