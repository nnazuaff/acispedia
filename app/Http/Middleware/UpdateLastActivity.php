<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class UpdateLastActivity
{
    /**
     * Update the authenticated user's last activity timestamp.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        try {
            $user = $request->user();
            if (! $user) {
                return $response;
            }

            static $hasColumns = null;
            if ($hasColumns === null) {
                try {
                    $hasColumns = Schema::hasColumns('users', ['last_activity_at']);
                } catch (Throwable) {
                    $hasColumns = false;
                }
            }

            if (! $hasColumns) {
                return $response;
            }

            $now = now();

            // Throttle writes: update at most once per 60 seconds.
            $shouldUpdate = true;
            if ($user->last_activity_at) {
                try {
                    $shouldUpdate = $user->last_activity_at->diffInSeconds($now) >= 60;
                } catch (Throwable) {
                    $shouldUpdate = true;
                }
            }

            if ($shouldUpdate) {
                $user->forceFill([
                    'last_activity_at' => $now,
                ])->save();
            }
        } catch (Throwable) {
            // Best-effort only.
        }

        return $response;
    }
}
