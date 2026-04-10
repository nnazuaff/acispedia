<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;

class AttemptToAuthenticateVerifiedUser
{
    public function __invoke(Request $request): void
    {
        $usernameField = Fortify::username();
        $username = (string) $request->input($usernameField);
        $password = (string) $request->input('password');
        $remember = (bool) $request->boolean('remember');

        $guard = Auth::guard(config('fortify.guard', 'web'));

        if ($username === '' || $password === '') {
            throw ValidationException::withMessages([
                $usernameField => __('auth.failed'),
            ]);
        }

        $credentials = [$usernameField => $username, 'password' => $password];

        if (! $guard->validate($credentials)) {
            throw ValidationException::withMessages([
                $usernameField => __('auth.failed'),
            ]);
        }

        /** @var User|null $user */
        $normalized = Str::lower(trim($username));

        $user = User::query()
            ->whereRaw('lower('.$usernameField.') = ?', [$normalized])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                $usernameField => __('auth.failed'),
            ]);
        }

        if (method_exists($user, 'hasVerifiedEmail') && ! $user->hasVerifiedEmail()) {
            $key = 'verify:login:send:'.$user->getKey().'|'.$request->ip();

            if (! RateLimiter::tooManyAttempts($key, 3)) {
                RateLimiter::hit($key, 600);
                $user->sendEmailVerificationNotification();
            }

            throw ValidationException::withMessages([
                $usernameField => 'Email belum terverifikasi. Kami sudah kirim link verifikasi, silakan cek inbox/spam.',
            ]);
        }

        if (! $guard->attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                $usernameField => __('auth.failed'),
            ]);
        }
    }
}
