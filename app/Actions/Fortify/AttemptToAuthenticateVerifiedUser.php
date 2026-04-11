<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;

class AttemptToAuthenticateVerifiedUser
{
    public function __invoke(Request $request): void
    {
        $usernameField = Fortify::username();
        $username = (string) $request->input($usernameField);
        $password = (string) $request->input('password');
        $remember = (bool) $request->boolean('remember');

        $guard = Auth::guard(config('fortify.guard', 'web'));
        $limiter = app(LoginRateLimiter::class);

        if ($username === '' || $password === '') {
            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.invalid_credentials'),
            ]);
        }

        $normalized = Str::lower(trim($username));

        /** @var User|null $user */
        $user = User::query()
            ->whereRaw('lower('.$usernameField.') = ?', [$normalized])
            ->first();

        if (! $user) {
            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.invalid_credentials'),
            ]);
        }

        $credentials = [$usernameField => (string) $user->{$usernameField}, 'password' => $password];

        if (! $guard->validate($credentials)) {
            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.invalid_credentials'),
            ]);
        }

        if (method_exists($user, 'hasVerifiedEmail') && ! $user->hasVerifiedEmail()) {
            $key = 'verify:login:send:'.$user->getKey().'|'.$request->ip();

            if (! \Illuminate\Support\Facades\RateLimiter::tooManyAttempts($key, 3)) {
                \Illuminate\Support\Facades\RateLimiter::hit($key, 600);
                $user->sendEmailVerificationNotification();
            }

            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.email_not_verified'),
            ]);
        }

        $guard->login($user, $remember);
        $limiter->clear($request);
    }
}
