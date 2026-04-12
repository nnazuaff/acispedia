<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Services\DashboardStats;
use App\Services\TripayClient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepositController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $stats = $user ? DashboardStats::forUser((int) $user->id) : DashboardStats::empty();

        $activePending = null;
        if ($user) {
            $activePending = Deposit::query()
                ->where('user_id', (int) $user->id)
                ->where('status', 'pending')
                ->where(function (Builder $q) {
                    $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
                })
                ->orderByDesc('created_at')
                ->first(['id', 'status', 'tripay_checkout_url', 'expired_at', 'created_at']);
        }

        return Inertia::render('deposit', [
            'balance' => (int) ($stats['balance'] ?? 0),
            'tripay_enabled' => TripayClient::isEnabled(),
            'active_pending' => $activePending ? [
                'id' => (int) $activePending->id,
                'status' => (string) $activePending->status,
                'tripay_checkout_url' => $activePending->tripay_checkout_url ? (string) $activePending->tripay_checkout_url : null,
                'created_at' => $activePending->created_at?->toISOString(),
                'expired_at' => $activePending->expired_at?->toISOString(),
            ] : null,
        ]);
    }
}
