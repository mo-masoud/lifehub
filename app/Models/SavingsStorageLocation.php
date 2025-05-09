<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingsStorageLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
    ];

    public function initialSavings(): HasMany
    {
        return $this->hasMany(InitialSaving::class, 'storage_location_id');
    }

    /**
     * Determine if this location is a system-wide (default) location.
     */
    public function isSystemDefault(): bool
    {
        return is_null($this->user_id);
    }

    public function latestSnapshotItems()
    {
        return $this->hasMany(SnapshotItem::class, 'storage_location_id')
            ->where('snapshot_id', function ($query) {
                $query->select('id')
                    ->from('snapshots')
                    ->whereColumn('user_id', 'user_id')
                    ->orderByDesc('created_at')
                    ->limit(1);
            });
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'storage_location_id');
    }

    /**
     * Get the user that owns this storage location.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
