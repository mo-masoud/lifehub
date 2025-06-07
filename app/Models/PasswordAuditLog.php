<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PasswordAuditLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'password_audit_logs';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'password_id',
        'user_id',
        'action',
        'ip_address',
        'context',
        'metadata',
        'created_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $appends = [
        'action_display',
        'masked_password_name',
        'created_at_formatted',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the password that this audit log belongs to.
     */
    public function password(): BelongsTo
    {
        return $this->belongsTo(Password::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include logs for passwords owned by a specific user.
     */
    public function scopeForPasswordsOwnedBy(Builder $query, User $user): Builder
    {
        return $query->whereHas('password', function (Builder $passwordQuery) use ($user) {
            $passwordQuery->where('user_id', $user->id);
        });
    }

    /**
     * Scope a query to filter by action.
     */
    public function scopeWithAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to filter by password.
     */
    public function scopeForPassword(Builder $query, int $passwordId): Builder
    {
        return $query->where('password_id', $passwordId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeInDateRange(Builder $query, ?string $startDate, ?string $endDate): Builder
    {
        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate . ' 23:59:59');
        }

        return $query;
    }

    /**
     * Get the formatted created at attribute.
     */
    public function createdAtFormatted(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at?->format('M j, Y g:i A')
        );
    }

    /**
     * Get the action display name.
     */
    public function actionDisplay(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->action) {
                'created' => 'Created',
                'updated' => 'Updated',
                'deleted' => 'Deleted',
                'copied' => 'Copied',
                'viewed' => 'Viewed',
                'bulk_deleted' => 'Bulk Deleted',
                'moved_to_folder' => 'Moved to Folder',
                'removed_from_folder' => 'Removed from Folder',
                default => ucfirst($this->action),
            }
        );
    }

    /**
     * Get a masked version of the password name for display.
     */
    public function maskedPasswordName(): Attribute
    {
        return Attribute::make(
            get: function () {
                $name = $this->password?->name ?? 'Unknown';

                // If the password name is longer than 20 characters, mask the middle
                if (strlen($name) > 20) {
                    return substr($name, 0, 8) . '****' . substr($name, -8);
                }

                // For shorter names, just mask some middle characters
                if (strlen($name) > 6) {
                    return substr($name, 0, 3) . '***' . substr($name, -3);
                }

                return $name;
            }
        );
    }
}
