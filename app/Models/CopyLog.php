<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CopyLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'copyable_type',
        'copyable_id',
        'field',
        'copied_at',
    ];

    protected $casts = [
        'copied_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function copyable(): MorphTo
    {
        return $this->morphTo();
    }
}
