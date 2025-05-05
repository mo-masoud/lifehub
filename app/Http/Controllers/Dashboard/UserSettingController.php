<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Settings\SaveUserSettingRequest;
use App\Models\UserSetting;

class UserSettingController extends Controller
{
    public function updateRateFallback(SaveUserSettingRequest $request) {
        $user = auth()->user();

        UserSetting::set($user, 'usd_rate_fallback', $request->usd_rate_fallback);
        UserSetting::set($user, 'gold24_rate_fallback', $request->gold24_rate_fallback);
        UserSetting::set($user, 'gold21_rate_fallback', $request->gold21_rate_fallback);

        return back()->with('success', 'Settings updated successfully');
    }
}
