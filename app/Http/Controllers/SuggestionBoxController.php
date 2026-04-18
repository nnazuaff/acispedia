<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use App\Services\TelegramNotifications;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SuggestionBoxController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('kotak-saran', [
            'defaults' => [
                'name' => (string) ($user?->name ?? ''),
                'phone' => (string) ($user?->phone ?? ''),
            ],
            'categories' => [
                ['value' => 'saran', 'label' => 'Saran'],
                ['value' => 'keluhan', 'label' => 'Keluhan'],
                ['value' => 'lainnya', 'label' => 'Lainnya'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'min:6', 'max:25'],
            'category' => ['required', 'string', 'in:saran,keluhan,lainnya'],
            'message' => ['required', 'string', 'min:5', 'max:10000'],
        ]);

        $suggestion = Suggestion::query()->create([
            'user_id' => (int) $user->id,
            'name' => trim((string) $validated['name']),
            'phone' => trim((string) $validated['phone']),
            'category' => trim((string) $validated['category']),
            'message' => trim((string) $validated['message']),
        ]);

        try {
            TelegramNotifications::suggestionSubmitted($suggestion, $user);
        } catch (Throwable) {
            // best-effort
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Terima kasih! Saran Anda berhasil dikirim.']);

        return back();
    }
}
