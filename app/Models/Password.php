<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Password extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'username',
        'last_used_at',
        'url',
        'expiry_at',
        'password',
        'folder_id',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'expiry_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function copyLogs(): MorphMany
    {
        return $this->morphMany(CopyLog::class, 'copyable');
    }

    /**
     * Get total copy count for this password
     */
    public function getCopyCount(): int
    {
        return $this->copyLogs()->count();
    }

    /**
     * Scope to order by copy count
     */
    public function scopeOrderByCopyCount($query, string $direction = 'desc')
    {
        return $query->leftJoin('copy_logs', function ($join) {
            $join->on('passwords.id', '=', 'copy_logs.copyable_id')
                ->where('copy_logs.copyable_type', '=', static::class);
        })
            ->selectRaw('passwords.*, COUNT(copy_logs.id) as copy_count')
            ->groupBy('passwords.id')
            ->orderBy('copy_count', $direction);
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn($value) => Crypt::encryptString($value),
            get: fn($value) => Crypt::decryptString($value),
        );
    }
}
