<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingsGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'target_amount_usd',
        'severity',
        'target_date',
        'is_achieved',
        'achieved_at',
        'success_notification_dismissed',
        'success_notification_shown_at',
    ];

    protected $casts = [
        'target_amount_usd' => 'decimal:2',
        'target_date' => 'date',
        'is_achieved' => 'boolean',
        'achieved_at' => 'datetime',
        'success_notification_dismissed' => 'boolean',
        'success_notification_shown_at' => 'datetime',
    ];

    protected $appends = ['target_amount_egp', 'current_amount_usd', 'current_amount_egp', 'progress_percentage', 'is_overdue'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get target amount in EGP (dynamically calculated)
     */
    public function targetAmountEgp(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->target_amount_usd * $this->user->getUsdRate()
        );
    }

    /**
     * Get current savings amount in USD based on latest snapshot
     */
    public function currentAmountUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                $latestSnapshot = $this->user->snapshots()->latest()->first();

                return $latestSnapshot ? $latestSnapshot->total_usd : 0;
            }
        );
    }

    /**
     * Get current savings amount in EGP based on latest snapshot
     */
    public function currentAmountEgp(): Attribute
    {
        return Attribute::make(
            get: function () {
                $latestSnapshot = $this->user->snapshots()->latest()->first();

                return $latestSnapshot ? $latestSnapshot->total_egp : 0;
            }
        );
    }

    /**
     * Get progress percentage (0-100)
     */
    public function progressPercentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->target_amount_usd <= 0) {
                    return 0;
                }

                $progress = ($this->current_amount_usd / $this->target_amount_usd) * 100;

                return min(100, max(0, round($progress, 1)));
            }
        );
    }

    /**
     * Check if goal is overdue
     */
    public function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->target_date && $this->target_date->isPast() && ! $this->is_achieved
        );
    }

    /**
     * Check if goal should show success notification
     */
    public function shouldShowSuccessNotification(): bool
    {
        if (! $this->is_achieved || $this->success_notification_dismissed) {
            return false;
        }

        // Show for 3 months after achievement
        if ($this->success_notification_shown_at) {
            return $this->success_notification_shown_at->diffInMonths(now()) < 3;
        }

        return true;
    }

    /**
     * Check if goal should show failure notification
     */
    public function shouldShowFailureNotification(): bool
    {
        return $this->is_overdue && ! $this->is_achieved;
    }

    /**
     * Mark goal as achieved
     */
    public function markAsAchieved(): void
    {
        $this->update([
            'is_achieved' => true,
            'achieved_at' => now(),
            'success_notification_shown_at' => now(),
        ]);
    }

    /**
     * Dismiss success notification
     */
    public function dismissSuccessNotification(): void
    {
        $this->update([
            'success_notification_dismissed' => true,
        ]);
    }

    /**
     * Check and update achievement status based on current savings
     */
    public function checkAndUpdateAchievement(): void
    {
        if (! $this->is_achieved && $this->current_amount_usd >= $this->target_amount_usd) {
            $this->markAsAchieved();
        }
    }

    /**
     * Get severity color class
     */
    public function getSeverityColor(): string
    {
        return match ($this->severity) {
            'low' => 'text-blue-600 dark:text-blue-400',
            'medium' => 'text-yellow-600 dark:text-yellow-400',
            'high' => 'text-orange-600 dark:text-orange-400',
            'very-high' => 'text-red-600 dark:text-red-400',
            default => 'text-gray-600 dark:text-gray-400',
        };
    }

    /**
     * Get severity background color class
     */
    public function getSeverityBackgroundColor(): string
    {
        return match ($this->severity) {
            'low' => 'bg-blue-100 dark:bg-blue-900/30',
            'medium' => 'bg-yellow-100 dark:bg-yellow-900/30',
            'high' => 'bg-orange-100 dark:bg-orange-900/30',
            'very-high' => 'bg-red-100 dark:bg-red-900/30',
            default => 'bg-gray-100 dark:bg-gray-900/30',
        };
    }

    /**
     * Scope for important goals (high/very-high severity or near deadline)
     */
    public function scopeImportant($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('severity', ['high', 'very-high'])
                ->orWhere(function ($sq) {
                    $sq->whereNotNull('target_date')
                        ->where('target_date', '<=', now()->addMonths(2));
                });
        });
    }

    /**
     * Scope for active goals (not achieved)
     */
    public function scopeActive($query)
    {
        return $query->where('is_achieved', false);
    }

    /**
     * Convert EGP amount to USD using user's exchange rate
     */
    public static function convertEgpToUsd(float $egpAmount, User $user): float
    {
        $usdRate = $user->getUsdRate();

        return $egpAmount / $usdRate;
    }
}
