<?php

namespace App\Http\Requests\Dashboard\Savings\Transaction;

use App\Enums\SavingType;
use App\Enums\TransactionDirection;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->route('transaction')->user_id === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(SavingType::values())],
            'amount' => ['required', 'numeric', 'gt:0'],
            'direction' => ['required', Rule::in(TransactionDirection::values())],
            'storage_location_id' => ['nullable', 'required_unless:direction,transfer', 'exists:savings_storage_locations,id'],
            'transaction_category_id' => ['nullable', 'required_unless:direction,transfer', 'exists:transaction_categories,id'],
            'notes' => ['nullable', 'string'],

            'source_location_id' => ['nullable', 'required_if:direction,transfer', 'exists:savings_storage_locations,id'],
            'destination_location_id' => ['nullable', 'required_if:direction,transfer', 'exists:savings_storage_locations,id', 'different:source_location_id'],
        ];
    }
}
