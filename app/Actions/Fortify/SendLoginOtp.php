<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SendLoginOtp
{
    public function __invoke(Request $request)
    {
        $email = (string) $request->input('email');
        $password = (string) $request->input('password');
        $remember = (bool) $request->boolean('remember');

        if ($email === '' || $password === '') {
            throw ValidationException::withMessages([
                'email' => 'Email dan kata sandi wajib diisi.',
            ]);
        }

        $guard = Auth::guard(config('fortify.guard', 'web'));

        if (! $guard->validate(['email' => $email, 'password' => $password])) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if (! OtpService::send('login', $user->email)) {
            throw ValidationException::withMessages([
                'email' => 'Gagal mengirim OTP. Coba lagi beberapa saat.',
            ]);
        }

        $request->session()->put('otp_login_user_id', (int) $user->id);
        $request->session()->put('otp_login_remember', $remember);

        return redirect()->route('otp.login');
    }
}
