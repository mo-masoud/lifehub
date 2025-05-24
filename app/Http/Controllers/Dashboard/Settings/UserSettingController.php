<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Settings\SaveUserSettingRequest;
use App\Models\User;
use App\Models\UserSetting;

class UserSettingController extends Controller
{
    public function updateRateFallback(SaveUserSettingRequest $request)
    {
        /** @var User $user */
        $user = $request->user();

        UserSetting::set($user, 'usd_rate_fallback', $request->usdRateFallback);
        UserSetting::set($user, 'gold24_rate_fallback', $request->gold24RateFallback);
        UserSetting::set($user, 'gold21_rate_fallback', $request->gold21RateFallback);

        return back()->with('success', 'Settings updated successfully');
    }
}
