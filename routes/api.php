<?php

use App\Http\Controllers\Api\SavingsStorageLocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->prefix('savings/storage-locations')->group(function () {
    Route::get('/', [SavingsStorageLocationController::class, 'index']);
    Route::post('/', [SavingsStorageLocationController::class, 'store']);
});
