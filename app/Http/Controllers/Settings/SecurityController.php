<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [];
    }

    /**
     * Show the user's security settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response|RedirectResponse
    {
        if (
            Features::canManageTwoFactorAuthentication() &&
            Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')
        ) {
            $confirmedAt = (int) $request->session()->get('auth.password_confirmed_at', 0);
            $timeout = (int) config('auth.password_timeout', 10800);

            if ($confirmedAt <= 0 || (time() - $confirmedAt) > $timeout) {
                return redirect()->route('password.confirm');
            }
        }

        $props = [
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $request->ensureStateIsValid();

            $props['twoFactorEnabled'] = $request->user()->hasEnabledTwoFactorAuthentication();
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render('settings/security', $props);
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->forceFill([
            'password' => Hash::make((string) $request->input('password')),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Password berhasil diubah.']);

        return back();
    }
}
