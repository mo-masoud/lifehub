<?php

namespace App\Http\Requests\Folders;

use Illuminate\Foundation\Http\FormRequest;

class BulkDestroyFoldersRequest extends FormRequest
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
            'folder_ids' => ['required', 'array', 'min:1'],
            'folder_ids.*' => ['integer', 'exists:folders,id'],
        ];
    }

    /**
     * Get the validated folder IDs.
     */
    public function getFolderIds(): array
    {
        return $this->validated('folder_ids');
    }

    /**
     * Get the success message for bulk destroy.
     */
    public function getSuccessMessage(): string
    {
        $count = count($this->getFolderIds());

        return "{$count} folder".($count === 1 ? '' : 's').' deleted successfully.';
    }
}
