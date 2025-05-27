<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Crypt;

class SSH extends Model
{
    use HasFactory;

    protected $table = 'sshs';

    protected $fillable = [
        'user_id',
        'name',
        'username',
        'ip',
        'last_used_at',
        'password',
        'folder_id',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    protected $appends = ['prompt'];

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
     * Get total copy count for this SSH
     */
    public function getCopyCount(): int
    {
        return $this->copyLogs()->count();
    }

    /**
     * Scope to order by latest copy activity
     */
    public function scopeOrderByLatestCopy($query, string $direction = 'desc')
    {
        return $query->leftJoin('copy_logs', function ($join) {
            $join->on('sshs.id', '=', 'copy_logs.copyable_id')
                ->where('copy_logs.copyable_type', '=', 'ssh');
        })
            ->select('sshs.*')
            ->selectRaw('MAX(copy_logs.copied_at) as latest_copy_at')
            ->groupBy('sshs.id')
            ->orderByRaw('latest_copy_at IS NULL, latest_copy_at '.$direction);
    }

    protected function prompt(): Attribute
    {
        return Attribute::make(
            get: static fn ($value, $attributes) => sprintf(
                'ssh %s@%s',
                $attributes['username'],
                $attributes['ip']
            ),
        );
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => Crypt::encryptString($value),
            get: fn ($value) => Crypt::decryptString($value),
        );
    }
}
