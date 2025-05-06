<?php

use App\Http\Controllers\API\Dashboard\Savings\SavingsStorageLocationController;
use App\Http\Controllers\API\Dashboard\Savings\TransactionCategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::as('api.')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // dashboard apis
        Route::as('dashboard.')->prefix('dashboard')->group(function () {
            Route::as('savings.')->prefix('savings')->group(function () {

                Route::apiResource('transaction-categories', TransactionCategoryController::class)
                    ->only(['index', 'store']);

                Route::apiResource('storage-locations', SavingsStorageLocationController::class)
                    ->only(['index', 'store']);

            });
        });
    });
});
