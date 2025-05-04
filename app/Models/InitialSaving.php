<?php

namespace App\Models;

use App\Enums\SavingType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InitialSaving extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'storage_location_id',
    ];

    protected $casts = [
        'type' => SavingType::class,
        'amount' => 'decimal:2',
    ];

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(SavingsStorageLocation::class, 'storage_location_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
