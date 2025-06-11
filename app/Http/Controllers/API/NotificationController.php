<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Get latest notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        $notifications = $this->notificationService->getLatestNotifications($request->user(), $limit);

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount($request->user());

        return response()->json([
            'status' => 'success',
            'data' => ['count' => $count],
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $success = $this->notificationService->markAsRead($request->user(), $id);

        if (!$success) {
            return response()->json([
                'status' => 'fail',
                'data' => ['message' => 'Notification not found or already read'],
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['message' => 'Notification marked as read'],
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($request->user());

        return response()->json([
            'status' => 'success',
            'data' => ['message' => "Marked {$count} notifications as read"],
        ]);
    }

    /**
     * Get paginated notifications
     */
    public function paginated(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $notifications = $this->notificationService->getPaginatedNotifications($request->user(), $perPage);

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
        ]);
    }
}
