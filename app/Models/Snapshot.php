<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Snapshot extends Model
{
    protected $fillable = [
        'user_id', 'usd_rate', 'gold24_price', 'gold21_price',
    ];

    protected $appends = ['date', 'total_egp', 'total_usd'];

//    protected static function booted(): void
//    {
//        static::updating(function () {
//            throw new Exception('Snapshots are immutable.');
//        });
//
//        static::deleting(function () {
//            throw new Exception('Snapshots cannot be deleted.');
//        });
//    }

    public function date(): Attribute
    {
        return Attribute::make(
            get: function () {
                $createdAt = Carbon::parse($this->created_at);

                $monthName = __('shared.' . $createdAt->format('F'));

                $day   = $createdAt->day;
                $year  = $createdAt->year;

                return "{$day} - {$monthName} - {$year}";
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
            get: fn () => $this->items->sum(function ($item) {
                return ($item->amount * $item->rate) / $this->usd_rate;
            })
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
