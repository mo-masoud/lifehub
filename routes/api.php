<?php

use App\Http\Controllers\API\Dashboard\Savings\SavingsStorageLocationController;
use App\Http\Controllers\API\Dashboard\Savings\TransactionCategoryController;
use App\Http\Controllers\Dashboard\Savings\SavingsGoalsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::as('api.')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // dashboard apis
        Route::as('dashboard.')->prefix('dashboard')->group(function () {
            Route::apiResource('folders', App\Http\Controllers\API\Dashboard\FolderController::class)
                ->only(['index', 'store']);

            Route::as('savings.')->prefix('savings')->group(function () {
                Route::get('goals', [SavingsGoalsController::class, 'apiIndex'])
                    ->name('goals.index');

                Route::apiResource('transaction-categories', TransactionCategoryController::class)
                    ->only(['index', 'store']);

                Route::apiResource('storage-locations', SavingsStorageLocationController::class)
                    ->only(['index', 'store']);
            });
        });
    });
});
