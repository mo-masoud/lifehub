<?php

namespace App\Http\Requests\Dashboard\Savings\InitialSavings;

use App\Enums\SavingType;
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
        return $this->user()->can('update', $this->route('initialSaving'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => [
                'required',
                'string',
                'in:' . implode(',', SavingType::values()),
                Rule::unique('initial_savings')->where(function ($query) {
                    return $query->where('storage_location_id', request('storage_location_id'))
                        ->where('user_id', auth()->id());
                })->ignore($this->route('initialSaving')->id)
            ],

            'amount' => 'required|numeric|min:0',
            'storage_location_id' => 'required|numeric|exists:savings_storage_locations,id',
        ];
    }
}
