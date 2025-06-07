<?php

namespace App\Http\Requests\Passwords;

use App\Enums\PasswordTypes;
use App\Models\Password;
use Illuminate\Foundation\Http\FormRequest;

class IndexPasswordsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', Password::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'folder_id' => ['nullable', 'string'],
            'sort' => ['nullable', 'string', 'in:name,username,last_used_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
            'type' => ['nullable', 'string', 'in:' . implode(',', PasswordTypes::values())],
            'show_expired' => ['nullable', 'boolean'],
            'show_expires_soon' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convert string boolean values to actual booleans
        if ($this->has('show_expired')) {
            $this->merge([
                'show_expired' => filter_var($this->show_expired, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }

        if ($this->has('show_expires_soon')) {
            $this->merge([
                'show_expires_soon' => filter_var($this->show_expires_soon, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }
    }
}
