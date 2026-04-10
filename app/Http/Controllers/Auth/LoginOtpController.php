<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginOtpController
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return redirect()->intended(config('fortify.home'));
        }

        if (! $request->session()->has('otp_login_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/login-otp', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'otp_code' => ['required', 'string'],
        ]);

        $userId = (int) $request->session()->get('otp_login_user_id', 0);
        $remember = (bool) $request->session()->get('otp_login_remember', false);

        if ($userId <= 0) {
            return redirect()->route('login');
        }

        $user = User::query()->find($userId);

        if (! $user) {
            $request->session()->forget(['otp_login_user_id', 'otp_login_remember']);

            return redirect()->route('login');
        }

        if (! OtpService::verify('login', $user->email, (string) $request->input('otp_code'))) {
            throw ValidationException::withMessages([
                'otp_code' => 'OTP tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        $request->session()->forget(['otp_login_user_id', 'otp_login_remember']);
        $request->session()->regenerate();

        Auth::guard(config('fortify.guard', 'web'))->login($user, $remember);

        return redirect()->intended(config('fortify.home'));
    }

    public function resend(Request $request): RedirectResponse
    {
        $userId = (int) $request->session()->get('otp_login_user_id', 0);

        if ($userId <= 0) {
            return redirect()->route('login');
        }

        $user = User::query()->find($userId);

        if ($user) {
            OtpService::send('login', $user->email);
        }

        return back()->with('status', 'OTP sudah dikirim ulang ke email.');
    }
}
