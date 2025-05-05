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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
