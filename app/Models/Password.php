<?php

namespace App\Models;

use App\Enums\PasswordTypes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Password extends Model
{
    /** @use HasFactory<\Database\Factories\PasswordFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'name',
        'username',
        'password',
        'url',
        'notes',
        'folder_id',
        'copied',
        'last_used_at',
        'expires_at',
    ];

    protected $appends = [
        'cli',
        'is_expired',
        'is_expired_soon',
        'last_used_at_formatted',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'type' => PasswordTypes::class,
        'folder_id' => 'integer',
        'copied' => 'integer',
        'last_used_at' => 'datetime',
        'expires_at' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function cli(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->type === PasswordTypes::SSH ? 'ssh ' . $this->username . '@' . $this->url : null,
        );
    }

    public function isExpired(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->expires_at && $this->expires_at < now(),
        );
    }

    public function isExpiredSoon(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->expires_at && $this->expires_at <= now()->addDays(15) && $this->expires_at > now(),
        );
    }

    public function lastUsedAtFormatted(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->last_used_at ? $this->last_used_at->diffForHumans() : $this->updated_at->diffForHumans(),
        );
    }

    public function password(): Attribute
    {
        return Attribute::make(
            get: fn($value) => decrypt($value),
            set: fn($value) => encrypt($value),
        );
    }

    public function scopeExpiresSoon($query)
    {
        return $query->whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays(15))
            ->where('expires_at', '>', now());
    }

    public function scopeWhereExpired($query)
    {
        return $query->whereNotNull('expires_at')
            ->where('expires_at', '<', now());
    }

    public function scopeSortByLastUsed($query)
    {
        return $query->orderByDesc('last_used_at')
            ->orderByDesc('updated_at');
    }

    public function scopeSortByCopied($query)
    {
        return $query->orderByDesc('copied');
    }

    public function scopeFilterByType($query, PasswordTypes $type)
    {
        return $query->where('type', $type);
    }

    public function scopeFilterByFolder($query, ?int $folderId)
    {
        if ($folderId) {
            return $query->where('folder_id', $folderId);
        }

        return $query->whereNull('folder_id');
    }
}
