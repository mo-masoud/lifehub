<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingsStorageLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
    ];

    /**
     * Determine if this location is a system-wide (default) location.
     */
    public function isSystemDefault(): bool
    {
        return is_null($this->user_id);
    }

    /**
     * Get the user that owns this storage location.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
