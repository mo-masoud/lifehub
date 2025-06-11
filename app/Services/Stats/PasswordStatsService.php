<?php

namespace App\Services\Stats;

use App\Enums\PasswordTypes;
use App\Models\Password;
use App\Models\User;
use Illuminate\Support\Collection;

class PasswordStatsService
{
    /**
     * Get password type distribution (Normal vs SSH)
     */
    public function getTypeDistribution(User $user): array
    {
        $distribution = $user->passwords()
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        return [
            'normal' => $distribution[PasswordTypes::Normal->value] ?? 0,
            'ssh' => $distribution[PasswordTypes::SSH->value] ?? 0,
        ];
    }

    /**
     * Get top most copied passwords
     */
    public function getTopCopiedPasswords(User $user, int $limit = 5): Collection
    {
        return $user->passwords()
            ->select('id', 'name', 'copied', 'type')
            ->where('copied', '>', 0)
            ->orderByDesc('copied')
            ->limit($limit)
            ->get()
            ->map(function ($password) {
                return [
                    'id' => $password->id,
                    'name' => $password->name,
                    'copied' => $password->copied,
                    'type' => $password->type->value,
                ];
            });
    }

    /**
     * Get total copied count for all passwords
     */
    public function getTotalCopiedCount(User $user): int
    {
        return $user->passwords()
            ->sum('copied');
    }

    /**
     * Get password security health overview
     */
    public function getSecurityHealthOverview(User $user): array
    {
        $passwords = $user->passwords()
            ->select('id', 'password', 'encrypted_key', 'key_version')
            ->get();

        $distribution = [
            'strong' => 0,
            'medium' => 0,
            'weak' => 0,
        ];

        foreach ($passwords as $password) {
            try {
                $strength = $password->password_power;

                if ($strength && isset($strength['score'])) {
                    $score = $strength['score'];

                    if ($score >= 3) {
                        $distribution['strong']++;
                    } elseif ($score >= 2) {
                        $distribution['medium']++;
                    } else {
                        $distribution['weak']++;
                    }
                } else {
                    // If we can't determine strength, consider it weak
                    $distribution['weak']++;
                }
            } catch (\Exception $e) {
                // If there's an error decrypting, consider it weak
                $distribution['weak']++;
            }
        }

        return $distribution;
    }

    /**
     * Get all statistics for a user
     */
    public function getAllStats(User $user): array
    {
        return [
            'type_distribution' => $this->getTypeDistribution($user),
            'top_copied_passwords' => $this->getTopCopiedPasswords($user),
            'total_copied_count' => $this->getTotalCopiedCount($user),
            'security_health' => $this->getSecurityHealthOverview($user),
        ];
    }
}
