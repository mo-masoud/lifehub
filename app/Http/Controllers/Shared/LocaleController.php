<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function __invoke(Request $request)
    {
        $locale = $request->input('locale');

        if (empty($locale)) {
            $errors = validator()->make(['locale' => $locale], ['locale' => 'required'])->errors();
            return redirect()->back()->withErrors($errors);
        }

        $available = config('x-dash.available_languages');

        if (!array_key_exists($locale, $available)) {
            $errors = validator()->make(['locale' => $locale], ['locale' => 'in:'.implode(',', $available)])->errors();
            return redirect()->back()->withErrors($errors);
        }

        $response = redirect()->back();
        $response->cookie('locale', $locale, 60 * 24 * 30);

        return $response;
    }
}
