<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function initialSavings(): HasMany
    {
        return $this->hasMany(InitialSaving::class);
    }

    public function passwords(): HasMany
    {
        return $this->hasMany(Password::class);
    }

    public function folders(): HasMany
    {
        return $this->hasMany(Folder::class);
    }

    public function settings(): HasMany
    {
        return $this->hasMany(UserSetting::class);
    }

    /**
     * The attributes that should be appended to the model's array form.
     *
     * @return list<string>
     */
    public function sshs(): HasMany
    {
        return $this->hasMany(SSH::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function snapshots(): HasMany
    {
        return $this->hasMany(Snapshot::class);
    }

    public function savingsGoals(): HasMany
    {
        return $this->hasMany(SavingsGoal::class);
    }

    /**
     * Get the USD exchange rate for this user.
     */
    public function getUsdRate(): float
    {
        $exchangeRateService = app(\App\Services\ExchangeRateService::class);

        return $exchangeRateService->getUsdRate($this);
    }

    /**
     * Get the USD exchange rate fallback for this user.
     */
    public function getUsdRateFallback(): float
    {
        return (float) UserSetting::get($this, 'usd_rate_fallback', 50);
    }

    /**
     * Get the Gold 24k rate fallback for this user.
     */
    public function getGold24Rate(): float
    {
        return (float) UserSetting::get($this, 'gold24_rate_fallback', 5000);
    }

    /**
     * Get the Gold 21k rate fallback for this user.
     */
    public function getGold21Rate(): float
    {
        return (float) UserSetting::get($this, 'gold21_rate_fallback', 4000);
    }

    /**
     * Get the user's exchange rate fetch frequency setting
     */
    public function getExchangeRateFrequency(): string
    {
        return UserSetting::get($this, 'exchange_rate_frequency', 'daily');
    }

    /**
     * Set the user's exchange rate fetch frequency
     */
    public function setExchangeRateFrequency(string $frequency): void
    {
        $validFrequencies = array_keys(config('exchange_rates.fetch_frequencies', []));

        if (! in_array($frequency, $validFrequencies)) {
            throw new \InvalidArgumentException('Invalid frequency. Must be one of: '.implode(', ', $validFrequencies));
        }

        UserSetting::set($this, 'exchange_rate_frequency', $frequency);
    }

    /**
     * Get exchange rates for this user
     */
    public function exchangeRates(): HasMany
    {
        return $this->hasMany(ExchangeRate::class);
    }

    /**
     * Manually refresh exchange rate
     */
    public function refreshExchangeRate(): array
    {
        $exchangeRateService = app(\App\Services\ExchangeRateService::class);

        return $exchangeRateService->manualRefresh($this);
    }

    /**
     * Get remaining manual API calls for today
     */
    public function getRemainingManualCalls(): int
    {
        $exchangeRateService = app(\App\Services\ExchangeRateService::class);

        return $exchangeRateService->getRemainingManualCalls($this);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
