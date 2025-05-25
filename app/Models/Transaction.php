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
        'transaction_category_id',
        'source_location_id',
        'destination_location_id',
        'notes',
        'original_amount',
        'original_type',
    ];

    protected $casts = [
        'amount' => 'float',
        'original_amount' => 'float',
    ];

    protected $appends = ['date'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(TransactionCategory::class, 'transaction_category_id');
    }

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

    public function sourceLocation(): BelongsTo
    {
        return $this->belongsTo(SavingsStorageLocation::class, 'source_location_id');
    }

    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(SavingsStorageLocation::class, 'destination_location_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * For transfers, calculate automatic currency conversion if needed
     * The amount represents the source amount, and type represents destination currency
     */
    public function processTransfer(): void
    {
        if (!$this->isTransfer()) {
            return;
        }

        // For transfers, we don't need automatic conversion here
        // The user specifies the source amount and target currency type
        // The conversion logic will be handled by the convertToEgp method
        // which works on the final amount and type
    }

    /**
     * Convert amount to EGP and store both original and converted values
     */
    public function convertToEgp(): void
    {
        // Only convert if we have a valid currency type that needs conversion
        if (!in_array($this->type, ['USD', 'GOLD24', 'GOLD21'])) {
            return;
        }

        // Load user if not already loaded
        if (!$this->relationLoaded('user')) {
            $this->load('user');
        }

        $user = $this->user;
        if (!$user) {
            return;
        }

        switch ($this->type) {
            case 'USD':
                $this->original_amount = $this->amount;
                $this->original_type = $this->type;
                $this->amount = $this->amount * $user->getUsdRate();
                $this->type = 'EGP';
                break;
            case 'GOLD24':
                $this->original_amount = $this->amount;
                $this->original_type = $this->type;
                $this->amount = $this->amount * $user->getGold24Rate();
                $this->type = 'EGP';
                break;
            case 'GOLD21':
                $this->original_amount = $this->amount;
                $this->original_type = $this->type;
                $this->amount = $this->amount * $user->getGold21Rate();
                $this->type = 'EGP';
                break;
        }
    }

    /**
     * Boot the model to automatically convert currencies
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            $transaction->convertToEgp();
        });

        static::updating(function ($transaction) {
            if ($transaction->isDirty(['type', 'amount'])) {
                $transaction->convertToEgp();
            }
        });
    }
}
