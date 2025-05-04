<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SSH extends Model
{
    use HasFactory;

    protected $table = 'sshs';

    protected $fillable = [
        'user_id',
        'name',
        'username',
        'ip',
        'last_used_at',
        'password',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    protected $appends = ['prompt'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function prompt(): Attribute
    {
        return Attribute::make(
            get: static fn($value, $attributes) => sprintf(
                'ssh %s@%s',
                $attributes['username'],
                $attributes['ip']
            ),
        );
    }
}
