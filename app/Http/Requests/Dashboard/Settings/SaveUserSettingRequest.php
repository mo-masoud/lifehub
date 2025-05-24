<?php

namespace App\Http\Requests\Dashboard\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveUserSettingRequest extends FormRequest
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
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'usdRateFallback' => 'required|numeric|min:0',
            'gold24RateFallback' => 'required|numeric|min:0',
            'gold21RateFallback' => 'required|numeric|min:0',
        ];
    }
}
