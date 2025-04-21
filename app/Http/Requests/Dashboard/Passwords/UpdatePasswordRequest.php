<?php

namespace App\Http\Requests\Dashboard\Passwords;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('password'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:passwords,name,'.$this->route('password')->id,
            'username' => 'required|string|max:255',
            'url' => 'nullable|url|max:255',
            'password' => 'required|string|min:8|max:255',
        ];
    }
}
