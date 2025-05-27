<?php

namespace App\Services;

use App\Models\CopyLog;
use App\Models\Password;
use App\Models\SSH;
use Illuminate\Database\Eloquent\Model;

class CopyLogService
{
    /**
     * Log a copy action for a given model and field
     */
    public function logCopy(Model $copyable, string $field, int $userId): CopyLog
    {
        // Validate that the model is either Password or SSH
        if (!($copyable instanceof Password) && !($copyable instanceof SSH)) {
            throw new \InvalidArgumentException('Copyable model must be either Password or SSH');
        }

        // Validate field based on model type
        $this->validateField($copyable, $field);

        return CopyLog::create([
            'user_id' => $userId,
            'copyable_type' => $copyable->getMorphClass(),
            'copyable_id' => $copyable->id,
            'field' => $field,
            'copied_at' => now(),
        ]);
    }

    /**
     * Validate that the field is appropriate for the given model
     */
    private function validateField(Model $copyable, string $field): void
    {
        $validFields = [];

        if ($copyable instanceof Password) {
            $validFields = ['password', 'username'];
        } elseif ($copyable instanceof SSH) {
            $validFields = ['password', 'username', 'prompt'];
        }

        if (!in_array($field, $validFields)) {
            throw new \InvalidArgumentException(
                "Invalid field '{$field}' for " . get_class($copyable) . ". Valid fields: " . implode(', ', $validFields)
            );
        }
    }

    /**
     * Get copy count for a specific model and field
     */
    public function getCopyCount(Model $copyable, ?string $field = null): int
    {
        $query = CopyLog::where('copyable_type', $copyable->getMorphClass())
            ->where('copyable_id', $copyable->id);

        if ($field) {
            $query->where('field', $field);
        }

        return $query->count();
    }

    /**
     * Get total copy count for a model (all fields)
     */
    public function getTotalCopyCount(Model $copyable): int
    {
        return $this->getCopyCount($copyable);
    }

    /**
     * Get copy statistics for a user's passwords or SSHs
     */
    public function getCopyStatistics(string $modelType, int $userId): array
    {
        if (!in_array($modelType, [Password::class, SSH::class])) {
            throw new \InvalidArgumentException('Model type must be Password or SSH');
        }

        return CopyLog::where('copyable_type', $modelType)
            ->where('user_id', $userId)
            ->selectRaw('copyable_id, field, COUNT(*) as copy_count')
            ->groupBy('copyable_id', 'field')
            ->get()
            ->groupBy('copyable_id')
            ->map(function ($logs) {
                return $logs->pluck('copy_count', 'field')->toArray();
            })
            ->toArray();
    }
}
