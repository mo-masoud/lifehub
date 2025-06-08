<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    /** @use HasFactory<\Database\Factories\FolderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'featured',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'featured' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function passwords()
    {
        return $this->hasMany(Password::class);
    }

    public function scopeOrdered($query)
    {
        return $query->withMax('passwords', 'updated_at')
            ->withCount('passwords')
            ->orderBy('passwords_max_updated_at', 'desc')
            ->orderBy('featured', 'desc')
            ->orderBy('passwords_count', 'desc')
            ->orderBy('updated_at', 'desc')
            ->orderBy('name', 'asc');
    }
}
