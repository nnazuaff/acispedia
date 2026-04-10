<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GuestEmailVerificationController
{
    public function notice(Request $request): Response
    {
        return Inertia::render('auth/verify-email-guest', [
            'status' => $request->session()->get('status'),
            'email' => $request->session()->get('verify_email'),
        ]);
    }

    public function resend(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $normalized = Str::lower(trim((string) $data['email']));

        /** @var User|null $user */
        $user = User::query()->whereRaw('lower(email) = ?', [$normalized])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => 'Email tidak ditemukan.',
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return back()->with('status', 'email-already-verified');
        }

        $key = 'verify:resend:'.$user->getKey().'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            return back()->with('status', 'verify-rate-limited');
        }

        RateLimiter::hit($key, 600);
        $user->sendEmailVerificationNotification();

        $request->session()->put('verify_email', (string) $user->email);

        return back()->with('status', 'verification-link-sent');
    }

    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        /** @var User|null $user */
        $user = User::query()->find($id);

        if (! $user) {
            return redirect()->route('login')
                ->with('status', 'verify-user-not-found');
        }

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect()->route('login')
                ->with('status', 'verify-invalid-hash');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        Auth::guard(config('fortify.guard', 'web'))->login($user);
        $request->session()->regenerate();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Email berhasil diverifikasi.']);

        return redirect()->route('verified.success');
    }
}
