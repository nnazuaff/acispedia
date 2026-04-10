<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DevicesController extends Controller
{
    /**
     * Show the user's active sessions (devices) page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $currentSessionId = (string) $request->session()->getId();

        $rows = collect();
        try {
            if (Schema::hasTable('sessions')) {
                $rows = DB::table('sessions')
                    ->where('user_id', (int) $user->id)
                    ->orderByDesc('last_activity')
                    ->get(['id', 'ip_address', 'user_agent', 'last_activity']);
            }
        } catch (Throwable) {
            $rows = collect();
        }

        $sessions = $rows->map(function ($row) use ($currentSessionId) {
            $lastActivity = is_numeric($row->last_activity) ? (int) $row->last_activity : null;

            return [
                'id' => (string) $row->id,
                'ip_address' => $row->ip_address !== null ? (string) $row->ip_address : null,
                'user_agent' => $row->user_agent !== null ? (string) $row->user_agent : null,
                'last_activity_at' => $lastActivity ? now()->setTimestamp($lastActivity)->toISOString() : null,
                'is_current' => (string) $row->id === $currentSessionId,
            ];
        })->values();

        return Inertia::render('settings/devices', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Log out from all other devices.
     */
    public function destroyAll(Request $request): RedirectResponse
    {
        $user = $request->user();
        $currentSessionId = (string) $request->session()->getId();

        if (! Schema::hasTable('sessions')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Fitur devices belum aktif.']);
            return to_route('devices.edit');
        }

        DB::table('sessions')
            ->where('user_id', (int) $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil logout dari perangkat lain.']);

        return to_route('devices.edit');
    }

    /**
     * Log out a specific device/session.
     */
    public function destroy(Request $request, string $sessionId): RedirectResponse
    {
        $user = $request->user();
        $currentSessionId = (string) $request->session()->getId();

        if (! Schema::hasTable('sessions')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Fitur devices belum aktif.']);
            return to_route('devices.edit');
        }

        if ($sessionId === $currentSessionId) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Tidak bisa logout perangkat yang sedang digunakan.']);
            return to_route('devices.edit');
        }

        $found = DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', (int) $user->id)
            ->exists();

        if (! $found) {
            abort(404);
        }

        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', (int) $user->id)
            ->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perangkat berhasil dilogout.']);

        return to_route('devices.edit');
    }
}
