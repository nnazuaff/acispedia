<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class CleanPasswordResetController
{
    public function link(Request $request, string $key): RedirectResponse
    {
        $payload = Cache::get('password_reset_link:'.$key);

        if (! is_array($payload)) {
            return redirect()->route('password.request')
                ->with('status', 'reset-link-invalid');
        }

        $email = (string) ($payload['email'] ?? '');
        $token = (string) ($payload['token'] ?? '');

        if ($email === '' || $token === '') {
            return redirect()->route('password.request')
                ->with('status', 'reset-link-invalid');
        }

        $request->session()->put('password_reset', [
            'email' => $email,
            'token' => $token,
        ]);

        return redirect()->route('password.reset.clean');
    }

    public function show(Request $request): Response|RedirectResponse
    {
        $data = $request->session()->get('password_reset');

        if (! is_array($data)) {
            return redirect()->route('password.request');
        }

        $email = (string) ($data['email'] ?? '');
        $token = (string) ($data['token'] ?? '');

        if ($email === '' || $token === '') {
            return redirect()->route('password.request');
        }

        return Inertia::render('auth/reset-password', [
            'email' => $email,
            'token' => $token,
        ]);
    }
}
