<?php

namespace App\Http\Requests\Dashboard\Savings\SavingsGoals;

use App\Models\SavingsGoal;
use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', SavingsGoal::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0.01',
            'currency' => 'required|in:USD,EGP',
            'safety_margin_percentage' => 'nullable|numeric|min:0|max:100',
            'severity' => 'required|in:low,medium,high,very-high',
            'target_date' => 'nullable|date|after_or_equal:today',
        ];
    }
}
