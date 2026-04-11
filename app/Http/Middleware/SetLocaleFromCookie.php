<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromCookie
{
    /**
     * Set application locale from the "locale" cookie (id|en).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = (string) ($request->cookie('locale') ?? '');

        if (in_array($locale, ['id', 'en'], true)) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
