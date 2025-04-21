<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function __invoke(Request $request)
    {
        $languages = array_values(config('x-dash.available_languages'));

        return inertia('dashboard/settings/locale', compact('languages'));
    }
}
