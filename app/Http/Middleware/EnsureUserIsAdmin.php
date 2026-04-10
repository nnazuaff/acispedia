<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $allowedEmails = (array) config('admin.emails', []);
        $email = strtolower(trim((string) $user->email));

        if ($email === '' || $allowedEmails === [] || ! in_array($email, array_map('strtolower', $allowedEmails), true)) {
            abort(403);
        }

        return $next($request);
    }
}
