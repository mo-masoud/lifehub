<?php

namespace App\Http\Requests\Dashboard\Folders;

use App\Models\Folder;
use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Folder::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:folders,name,NULL,id,user_id,'.$this->user()->id,
        ];
    }
}
