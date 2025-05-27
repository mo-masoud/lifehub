<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Http\Controllers\Controller;

class AppearanceController extends Controller
{
    public function show()
    {
        return inertia('dashboard/settings/appearance');
    }
}
