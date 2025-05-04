<?php

namespace App\Http\Requests\Dashboard\SSHs;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSSHRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', SSH::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:sshs|max:255',
            'username' => 'required_without:prompt|nullable|string|max:255',
            'ip' => 'required_without:prompt|nullable|string|max:255',
            'prompt' => 'required_without:username,ip|nullable|string|max:255',
            'password' => 'required|string|min:8|max:255',
        ];
    }
}
