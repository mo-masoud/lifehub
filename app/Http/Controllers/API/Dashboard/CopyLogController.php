<?php

namespace App\Http\Controllers\API\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\CopyLogRequest;
use App\Models\Password;
use App\Models\SSH;
use App\Services\CopyLogService;
use Illuminate\Http\JsonResponse;

class CopyLogController extends Controller
{
    public function __construct(
        private CopyLogService $copyLogService
    ) {}

    /**
     * Store a new copy log entry
     */
    public function store(CopyLogRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Find the copyable model
        $copyable = match ($validated['copyable_type']) {
            'password' => Password::findOrFail($validated['copyable_id']),
            'ssh' => SSH::findOrFail($validated['copyable_id']),
            default => throw new \InvalidArgumentException('Invalid copyable type')
        };

        // Authorize access to the model
        match ($validated['copyable_type']) {
            'password' => $this->authorize('view', $copyable),
            'ssh' => $this->authorize('view', $copyable),
        };

        // Log the copy action
        $copyLog = $this->copyLogService->logCopy(
            $copyable,
            $validated['field'],
            $request->user()->id
        );

        return response()->json([
            'message' => __('dashboard.copy_logs.logged_successfully'),
            'copy_log' => $copyLog,
        ], 201);
    }
}
