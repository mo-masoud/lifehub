<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'direction',
        'storage_location_id',
        'from_type',
        'from_amount',
        'notes',
    ];

    protected $casts = [
        'amount' => 'float',
        'from_amount' => 'float',
    ];

    protected $appends = ['date'];

    public function date(): Attribute
    {
        return Attribute::make(
            get: function () {
                $createdAt = Carbon::parse($this->created_at);

                $monthName = __('shared.' . $createdAt->format('F'));

                $day = $createdAt->day;
                $year = $createdAt->year;

                return "{$day} {$monthName} {$year}";
            },
        );
    }

    public function isIn(): bool
    {
        return $this->direction === 'in';
    }

    public function isOut(): bool
    {
        return $this->direction === 'out';
    }

    public function isTransfer(): bool
    {
        return $this->direction === 'transfer';
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(SavingsStorageLocation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
