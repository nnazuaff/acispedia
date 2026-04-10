<?php

namespace App\Actions\Fortify;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;

class EnsureLoginIsNotThrottledInline
{
    public function __construct(private readonly LoginRateLimiter $limiter) {}

    public function handle(Request $request, callable $next): mixed
    {
        if (! $this->limiter->tooManyAttempts($request)) {
            return $next($request);
        }

        event(new Lockout($request));

        $seconds = $this->limiter->availableIn($request);

        throw ValidationException::withMessages([
            Fortify::username() => "Too many login attempts. Please try again in {$seconds} seconds.",
        ]);
    }
}
