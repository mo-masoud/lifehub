<?php

namespace App\Models;

use App\Enums\PasswordTypes;
use App\Services\EnvelopeEncryptionService;
use App\Services\PasswordStrengthCalculator;
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
        'encrypted_key',
        'key_version',
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
        'expires_at_formatted',
        'password_power',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'type' => PasswordTypes::class,
        'folder_id' => 'integer',
        'key_version' => 'integer',
        'copied' => 'integer',
        'last_used_at' => 'datetime',
        'expires_at' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(PasswordAuditLog::class);
    }

    public function cli(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->type === PasswordTypes::SSH ? 'ssh '.$this->username.'@'.$this->url : null,
        );
    }

    public function isExpired(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->expires_at && $this->expires_at < now(),
        );
    }

    public function passwordPower(): Attribute
    {
        return Attribute::make(
            get: fn () => (new PasswordStrengthCalculator)->calculateStrength($this->password),
        );
    }

    public function isExpiredSoon(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->expires_at && $this->expires_at <= now()->addDays(15) && $this->expires_at > now(),
        );
    }

    public function lastUsedAtFormatted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->last_used_at ? $this->last_used_at->diffForHumans() : '-',
        );
    }

    public function expiresAtFormatted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->expires_at ? $this->expires_at->diffForHumans() : '-',
        );
    }

    public function password(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                // Return null for null or missing values
                if ($value === null) {
                    return null;
                }

                // If empty string, check if we have encryption metadata
                if ($value === '') {
                    // If we have encryption metadata but empty password, this is inconsistent - return null
                    if ($this->encrypted_key || $this->key_version) {
                        return null;
                    }

                    // Otherwise, return empty string (no encryption was used)
                    return '';
                }

                // Get encrypted key and version
                $encryptedKey = $this->encrypted_key;
                $keyVersion = $this->key_version;

                // If we don't have the required fields, this might be legacy data or an error
                if (empty($encryptedKey) || empty($keyVersion)) {
                    throw new \RuntimeException('Password is missing envelope encryption fields (encrypted_key or key_version)');
                }

                try {
                    $encryptionService = app(EnvelopeEncryptionService::class);

                    return $encryptionService->decrypt($value, $encryptedKey, $keyVersion);
                } catch (\Exception $e) {
                    \Log::error('Failed to decrypt password with envelope encryption', [
                        'password_id' => $this->id,
                        'error' => $e->getMessage(),
                    ]);
                    throw $e;
                }
            }
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

    public function scopeFilterByExpiry($query, ?string $expiryFilter = null)
    {
        // Default to showing all passwords if no filter is specified
        if (! $expiryFilter || $expiryFilter === 'all') {
            return $query; // No additional filtering
        }

        // If only expired should be shown
        if ($expiryFilter === 'expired') {
            return $query->whereNotNull('expires_at')
                ->where('expires_at', '<', now());
        }

        // If only expires soon should be shown
        if ($expiryFilter === 'expires_soon') {
            return $query->whereNotNull('expires_at')
                ->where('expires_at', '<=', now()->addDays(15))
                ->where('expires_at', '>', now());
        }

        return $query;
    }
}
