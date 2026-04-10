<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockAdminDomainAuthExtras
{
    /**
     * Admin domain should only allow login/logout.
     * Block registration/password reset/guest email verification endpoints.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $adminDomain = (string) config('admin.domain', '');

        if ($adminDomain === '' || strcasecmp($request->getHost(), $adminDomain) !== 0) {
            return $next($request);
        }

        $path = trim($request->path(), '/');
        $pathLower = strtolower($path);

        $blockedExact = [
            'register',
            'forgot-password',
            'reset-password',
            'verify-email',
            'verify-email/resend',
        ];

        if (in_array($pathLower, $blockedExact, true)) {
            abort(404);
        }

        if (str_starts_with($pathLower, 'reset-password-link/')) {
            abort(404);
        }

        if (str_starts_with($pathLower, 'verify-email/')) {
            abort(404);
        }

        return $next($request);
    }
}
