<?php

namespace App\Http\Requests\AuditLog;

use App\Models\PasswordAuditLog;
use Illuminate\Foundation\Http\FormRequest;

class IndexAuditLogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', PasswordAuditLog::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'password_id' => ['nullable', 'integer', 'exists:passwords,id'],
            'action' => ['nullable', 'string', 'in:created,updated,deleted,copied,viewed,bulk_deleted,moved_to_folder,removed_from_folder'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'in:10,20,30,50'],
            'page' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', 'string', 'in:created_at,action'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }

    /**
     * Get the validated data with defaults applied.
     */
    public function getValidatedFilters(): array
    {
        $validated = $this->validated();

        return [
            'password_id' => $validated['password_id'] ?? null,
            'action' => $validated['action'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'search' => $validated['search'] ?? null,
            'per_page' => $validated['per_page'] ?? 10,
            'page' => $validated['page'] ?? 1,
            'sort' => $validated['sort'] ?? 'created_at',
            'direction' => $validated['direction'] ?? 'desc',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure password_id belongs to the authenticated user
        if ($this->has('password_id') && $this->password_id) {
            $password = $this->user()->passwords()->find($this->password_id);
            if (!$password) {
                // Invalid password_id for this user, remove it
                $this->merge(['password_id' => null]);
            }
        }
    }
}
