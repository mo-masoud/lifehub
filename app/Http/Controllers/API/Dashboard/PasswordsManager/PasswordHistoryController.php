<?php

namespace App\Http\Controllers\API\Dashboard\PasswordsManager;

use App\Http\Controllers\Controller;
use App\Models\Password;
use App\Models\PasswordHistory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PasswordHistoryController extends Controller
{
    /**
     * Get password history for a specific password
     */
    public function index(Request $request, Password $password): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Check authorization - user can only view history for their own passwords
        if ($user->cannot('viewForPassword', [PasswordHistory::class, $password])) {
            abort(403, __('dashboard.copy_logs.unauthorized'));
        }

        $histories = $password->passwordHistories()
            ->select(['id', 'old_password', 'changed_at'])
            ->orderBy('changed_at', 'desc')
            ->get()
            ->map(function ($history) {
                return [
                    'id' => $history->id,
                    'old_password' => $history->old_password,
                    'changed_at' => $history->changed_at,
                    'changed_at_formatted' => $history->changed_at->format('M d, Y H:i'),
                ];
            });

        return response()->json([
            'message' => __('dashboard.password_history.retrieved_successfully'),
            'data' => $histories,
            'password_name' => $password->name,
        ]);
    }
}
