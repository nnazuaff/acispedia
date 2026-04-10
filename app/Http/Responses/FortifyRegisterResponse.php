<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class FortifyRegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        /** @var Request $request */
        $user = $request->user();

        if ($user && method_exists($user, 'sendEmailVerificationNotification')) {
            $user->sendEmailVerificationNotification();
        }

        Auth::guard(config('fortify.guard', 'web'))->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($user) {
            $request->session()->put('verify_email', (string) $user->email);
        }

        return redirect()->route('verify.email.notice')
            ->with('status', 'verification-link-sent');
    }
}
