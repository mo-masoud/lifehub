<?php

namespace App\Http\Requests\Dashboard\Savings;

use App\Models\TransactionCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', TransactionCategory::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'direction' => ['required', 'string'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $query = TransactionCategory::where(function (Builder $query) {
                $query->where('user_id', auth()->id())->orWhereNull('user_id');
            })
                ->whereRaw('LOWER(name) = ?', [strtolower($this->name)])
                ->where('direction', $this->direction);

            if ($query->exists()) {
                $validator->errors()->add('name', 'Transaction category already exists.');
            }
        });
    }
}
