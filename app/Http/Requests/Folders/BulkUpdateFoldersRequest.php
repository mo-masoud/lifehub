<?php

namespace App\Http\Requests\Folders;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateFoldersRequest extends FormRequest
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
            'featured' => ['required', 'boolean'],
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
     * Get the featured status.
     */
    public function getFeaturedStatus(): bool
    {
        return $this->validated('featured');
    }

    /**
     * Get the success message for bulk update.
     */
    public function getSuccessMessage(): string
    {
        $count = count($this->getFolderIds());
        $action = $this->getFeaturedStatus() ? 'added to featured' : 'removed from featured';

        return "{$count} folder" . ($count === 1 ? '' : 's') . " {$action}.";
    }
}
