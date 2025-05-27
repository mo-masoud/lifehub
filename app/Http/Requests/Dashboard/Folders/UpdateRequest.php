<?php

namespace App\Http\Requests\Dashboard\Folders;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('folder'));
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $folder = $this->route('folder');

        return [
            'name' => 'required|string|max:255|unique:folders,name,' . $folder->id . ',id,user_id,' . $this->user()->id,
        ];
    }
}
