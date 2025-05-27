<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class PasswordHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'password_id',
        'old_password',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function password(): BelongsTo
    {
        return $this->belongsTo(Password::class);
    }

    /**
     * Encrypt/decrypt the old password field
     */
    protected function oldPassword(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => Crypt::encryptString($value),
            get: fn ($value) => Crypt::decryptString($value),
        );
    }
}
