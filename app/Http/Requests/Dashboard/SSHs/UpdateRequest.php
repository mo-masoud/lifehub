<?php

namespace App\Http\Requests\Dashboard\SSHs;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('ssh'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:sshs,name,'.$this->route('ssh')->id,
            'username' => 'required_without:prompt|nullable|string|max:255',
            'ip' => 'required_without:prompt|nullable|string|max:255',
            'prompt' => 'required_without:username,ip|nullable|string|max:255',
            'password' => 'required|string|min:8|max:255',
            'folder_id' => 'nullable|exists:folders,id',
        ];
    }
}
