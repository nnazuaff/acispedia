<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;

class AttemptToAuthenticateVerifiedUser
{
    public function handle(Request $request, Closure $next): mixed
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

        $credentials = [$usernameField => (string) $user->getAttribute($usernameField), 'password' => $password];

        if (! $guard->validate($credentials)) {
            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.invalid_credentials'),
            ]);
        }

        if (method_exists($user, 'hasVerifiedEmail') && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();

            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.email_not_verified'),
            ]);
        }

        $status = Str::lower(trim((string) ($user->account_status ?? 'active')));
        if ($status === 'banned') {
            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.account_banned'),
            ]);
        }

        if ($status === 'inactive') {
            $limiter->increment($request);

            throw ValidationException::withMessages([
                $usernameField => __('auth.account_inactive'),
            ]);
        }

        $guard->login($user, $remember);
        $limiter->clear($request);

        return $next($request);
    }
}
