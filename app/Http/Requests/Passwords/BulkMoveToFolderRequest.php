<?php

namespace App\Http\Requests\Passwords;

use Illuminate\Foundation\Http\FormRequest;

class BulkMoveToFolderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['required', 'integer', 'exists:passwords,id,user_id,' . auth()->id()],
            'folder_id' => ['nullable', 'integer', 'exists:folders,id,user_id,' . auth()->id()],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'At least one password must be selected.',
            'ids.*.exists' => 'One or more selected passwords do not exist or do not belong to you.',
            'folder_id.exists' => 'The selected folder does not exist or does not belong to you.',
        ];
    }
}
