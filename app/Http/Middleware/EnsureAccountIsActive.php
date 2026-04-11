<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $status = (string) ($user->account_status ?? 'active');
        if ($status === '') {
            $status = 'active';
        }

        if ($status === 'active') {
            return $next($request);
        }

        // Allow the user to log out even if disabled.
        if ($request->is('logout')) {
            return $next($request);
        }

        $message = $status === 'banned'
            ? 'Akun Anda dibanned.'
            : 'Akun Anda dinonaktifkan.';

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => $message,
            ], 403);
        }

        $request->session()->flash('error', $message);

        return redirect()->route('login');
    }
}
