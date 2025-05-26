<?php

namespace App\Http\Requests\Dashboard\Passwords;

use App\Models\Password;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Password::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:passwords|max:255',
            'username' => 'required|string|max:255',
            'url' => 'nullable|url|max:255',
            'password' => 'required|string|min:8|max:255',
            'folder_id' => 'nullable|exists:folders,id',
        ];
    }
}
