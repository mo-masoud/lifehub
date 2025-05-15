<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = ['user_id', 'key', 'value'];

    public static function get(User $user, string $key, $default = null): mixed
    {
        return static::query()
            ->where('user_id', $user->id)
            ->where('key', $key)
            ->value('value') ?? $default;
    }

    public static function set(User $user, string $key, $value): void
    {
        static::updateOrCreate([
            'user_id' => $user->id,
            'key' => $key,
        ], ['value' => $value]);
    }

    /**
     * Checks if the user has completed their initial savings setup.
     *
     * @param User $user The user to check.
     * @return bool True if the user has completed initial savings, false otherwise.
     */
    public static function hasCompletedInitialSavings(User $user): bool
    {
        return (bool) static::get($user, 'initial_savings_completed', false);
    }

    /**
     * Marks the user's initial savings as completed.
     *
     * @param User $user The user to update.
     */
    public static function markInitialSavingsCompleted(User $user): void
    {
        static::set($user, 'initial_savings_completed', true);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
