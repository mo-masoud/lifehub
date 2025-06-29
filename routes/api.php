<?php

use App\Http\Controllers\API\FolderController;
use App\Http\Controllers\API\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->as('api.v1.')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('folders', FolderController::class)
            ->only(['index', 'store']);

        // Notification routes
        Route::prefix('notifications')->as('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::get('/paginated', [NotificationController::class, 'paginated']);
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
            Route::post('/{id}/mark-read', [NotificationController::class, 'markAsRead']);
        });
    });
});
