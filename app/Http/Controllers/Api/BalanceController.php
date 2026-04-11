<?php

namespace App\Http\Controllers\Api;

use App\Events\DashboardStatsUpdated;
use App\Http\Controllers\Controller;
use App\Models\UserBalance;
use App\Services\DashboardStats;
use App\Support\WalletLedgerWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class BalanceController extends Controller
{
    public function topup(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1', 'max:1000000000'],
        ]);

        $amount = (int) $validated['amount'];

        try {
            $balance = DB::transaction(function () use ($user, $amount) {
                UserBalance::query()->firstOrCreate([
                    'user_id' => $user->id,
                ], [
                    'balance' => 0,
                    'total_spent' => 0,
                    'total_deposit' => 0,
                ]);

                $row = UserBalance::query()
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (! $row) {
                    return 0;
                }

                $balanceBefore = (int) $row->balance;
                $balanceAfter = $balanceBefore + $amount;

                $row->balance = $balanceAfter;
                $row->total_deposit = (int) $row->total_deposit + $amount;
                $row->save();

                WalletLedgerWriter::record(
                    (int) $user->id,
                    'credit',
                    (int) $amount,
                    (int) $balanceBefore,
                    (int) $balanceAfter,
                    'topup',
                    null,
                    'Top up saldo',
                    null,
                    now(),
                );

                return (int) $row->balance;
            });
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal top up saldo.',
            ], 500);
        }

        $stats = DashboardStats::forUser((int) $user->id);

        try {
            broadcast(new DashboardStatsUpdated((int) $user->id, $stats));
        } catch (Throwable) {
            // Best-effort only.
        }

        return response()->json([
            'success' => true,
            'message' => 'Saldo berhasil ditambahkan.',
            'balance' => $balance,
            'stats' => $stats,
        ]);
    }
}
