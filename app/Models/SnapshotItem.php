<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SnapshotItem extends Model
{
    protected $fillable = [
        'snapshot_id',
        'type',
        'storage_location_id',
        'amount',
        'rate',
    ];

    public function snapshot(): BelongsTo
    {
        return $this->belongsTo(Snapshot::class);
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(SavingsStorageLocation::class, 'storage_location_id');
    }
}
