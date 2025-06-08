<?php

use App\Http\Controllers\API\FolderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->as('api.v1.')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('folders', FolderController::class)
            ->only(['index', 'store']);
    });
});
