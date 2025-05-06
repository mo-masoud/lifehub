<?php

use App\Http\Controllers\Api\SavingsStorageLocationController;
use App\Http\Controllers\Api\TransactionCategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::prefix('savings')->group(function () {

        Route::prefix('transaction-categories')->group(function () {
            Route::get('/', [TransactionCategoryController::class, 'index']);
            Route::post('/', [TransactionCategoryController::class, 'store']);
        });

        Route::prefix('storage-locations')->group(function () {
            Route::get('/', [SavingsStorageLocationController::class, 'index']);
            Route::post('/', [SavingsStorageLocationController::class, 'store']);
        });
    });
});
