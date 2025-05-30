<?php

namespace App\Http\Controllers\Dashboard\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard.home', absolute: false).'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            /** @var MustVerifyEmail $verifiableUser */
            $verifiableUser = $user;
            event(new Verified($verifiableUser));
        }

        return redirect()->intended(route('dashboard.home', absolute: false).'?verified=1');
    }
}
