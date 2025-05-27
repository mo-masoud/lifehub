<?php

namespace App\Models;

use Database\Factories\ExchangeRateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangeRate extends Model
{
    /** @use HasFactory<ExchangeRateFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'currency_code',
        'rate',
        'source',
        'fetched_at',
        'expires_at',
        'is_active',
        'api_response',
    ];

    protected $casts = [
        'rate' => 'decimal:8',
        'fetched_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'api_response' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the active exchange rate for a user and currency
     */
    public static function getActiveRate(User $user, string $currencyCode): ?float
    {
        $rate = static::where('user_id', $user->id)
            ->where('currency_code', $currencyCode)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        return $rate?->rate;
    }

    /**
     * Check if the rate is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the rate needs refreshing based on user's frequency setting
     */
    public function needsRefresh(User $user): bool
    {
        if ($this->isExpired()) {
            return true;
        }

        $frequency = $user->getExchangeRateFrequency();
        $frequencyConfig = config("exchange_rates.fetch_frequencies.{$frequency}");

        if (! $frequencyConfig) {
            return false;
        }

        $refreshThreshold = $this->fetched_at->addHours($frequencyConfig['hours']);

        return now()->greaterThan($refreshThreshold);
    }

    /**
     * Deactivate all rates for a user and currency
     */
    public static function deactivateAll(User $user, string $currencyCode): void
    {
        static::where('user_id', $user->id)
            ->where('currency_code', $currencyCode)
            ->update(['is_active' => false]);
    }

    /**
     * Create a new active rate
     */
    public static function createActive(array $attributes): static
    {
        // Deactivate existing rates first
        if (isset($attributes['user_id']) && isset($attributes['currency_code'])) {
            static::deactivateAll(
                User::find($attributes['user_id']),
                $attributes['currency_code']
            );
        }

        $attributes['is_active'] = true;
        $attributes['fetched_at'] = now();

        return static::create($attributes);
    }
}
