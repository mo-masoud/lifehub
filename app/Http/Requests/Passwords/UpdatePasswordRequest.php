<?php

namespace App\Http\Requests\Passwords;

use App\Enums\PasswordTypes;
use App\Models\Password;
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $password = $this->route('password');

        return [
            'name' => ['required', 'string', 'max:255', 'unique:passwords,name,' . $password->id . ',id,user_id,' . $this->user()->id],
            'type' => ['required', 'string', 'in:' . implode(',', PasswordTypes::values())],
            'username' => ['nullable', 'required_if:type,normal', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'cli' => ['nullable', 'string', 'max:255'],
            'folder_id' => ['nullable', 'integer', 'exists:folders,id,user_id,' . $this->user()->id],
            'expires_at' => ['nullable', 'date', 'after:now'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
