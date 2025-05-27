<?php

namespace App\Http\Requests\Dashboard;

use App\Models\CopyLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CopyLogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', CopyLog::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'copyable_type' => ['required', 'string', Rule::in(['password', 'ssh'])],
            'copyable_id' => ['required', 'integer', 'min:1'],
            'field' => ['required', 'string', function ($attribute, $value, $fail) {
                $copyableType = $this->input('copyable_type');

                $validFields = match ($copyableType) {
                    'password' => ['password', 'username'],
                    'ssh' => ['password', 'username', 'prompt'],
                    default => []
                };

                if (! in_array($value, $validFields)) {
                    $fail(__('dashboard.copy_logs.invalid_field_for_type', [
                        'field' => $value,
                        'type' => $copyableType,
                        'valid_fields' => implode(', ', $validFields),
                    ]));
                }
            }],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'copyable_type.required' => __('dashboard.copy_logs.copyable_type_required'),
            'copyable_type.in' => __('dashboard.copy_logs.copyable_type_invalid'),
            'copyable_id.required' => __('dashboard.copy_logs.copyable_id_required'),
            'copyable_id.integer' => __('dashboard.copy_logs.copyable_id_integer'),
            'copyable_id.min' => __('dashboard.copy_logs.copyable_id_min'),
            'field.required' => __('dashboard.copy_logs.field_required'),
        ];
    }
}
