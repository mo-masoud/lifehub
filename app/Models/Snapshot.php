<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Snapshot extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'usd_rate',
        'gold24_price',
        'gold21_price',
    ];

    protected $appends = ['date', 'total_egp', 'total_usd'];

    public function date(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->created_at->format('d M Y');
            },
        );
    }

    public function items(): HasMany
    {
        return $this->hasMany(SnapshotItem::class, 'snapshot_id', 'id');
    }

    public function totalEgp(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->items->sum(function ($item) {
                    return $item->amount * $item->rate;
                });
            }
        );
    }

    public function totalUsd(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->items->sum(function ($item) {
                return ($item->amount * $item->rate) / $this->usd_rate;
            })
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
