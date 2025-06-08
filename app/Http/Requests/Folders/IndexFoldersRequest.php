<?php

namespace App\Http\Requests\Folders;

use Illuminate\Foundation\Http\FormRequest;

class IndexFoldersRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', 'in:name,created_at,updated_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'featured' => ['nullable', 'string', 'in:all,featured,not_featured'],
        ];
    }

    /**
     * Get the filters array for the service.
     */
    public function getFilters(): array
    {
        return [
            'search' => $this->input('search'),
            'sort' => $this->input('sort'),
            'direction' => $this->input('direction'),
            'per_page' => $this->input('per_page', 10),
            'featured' => $this->input('featured'),
        ];
    }
}
