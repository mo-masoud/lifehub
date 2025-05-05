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
            'storage_location_id' => ['required', 'exists:savings_storage_locations,id'],
            'notes' => ['nullable', 'string'],

            'from_type' => ['nullable', 'required_if:direction,transfer', Rule::in(SavingType::values())],
            'from_amount' => ['nullable', 'required_if:direction,transfer', 'numeric', 'gt:0'],
        ];
    }
}
