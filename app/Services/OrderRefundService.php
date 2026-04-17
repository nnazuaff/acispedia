<?php

namespace App\Services;

use App\Models\Order;
use App\Models\UserBalance;
use App\Support\WalletLedgerWriter;
use Illuminate\Support\Facades\DB;
use Throwable;

final class OrderRefundService
{
    /**
     * Refund an order once (idempotent). Must be called for failure statuses only.
     */
    public static function refundIfEligible(int $orderId, string $reason): bool
    {
        if ($orderId <= 0) {
            return false;
        }

        $reason = trim($reason);
        if ($reason === '') {
            $reason = 'Refund order';
        }

        try {
            return (bool) DB::transaction(function () use ($orderId, $reason) {
                /** @var Order|null $order */
                $order = Order::query()->lockForUpdate()->find($orderId);
                if (! $order) {
                    return false;
                }

                return self::refundLockedOrder($order, $reason);
            });
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }

    /**
     * Refunds a locked order once (idempotent).
     *
     * Caller responsibility: the given $order must be selected with lockForUpdate().
     */
    public static function refundLockedOrder(Order $order, string $reason): bool
    {
        if ($order->refunded_at !== null) {
            return false;
        }

        $reason = trim($reason);
        if ($reason === '') {
            $reason = 'Refund order';
        }

        $amount = (int) ($order->total_price ?? 0);
        if ($amount <= 0) {
            $order->refunded_at = now();
            $order->save();

            return false;
        }

        UserBalance::query()->firstOrCreate([
            'user_id' => $order->user_id,
        ], [
            'balance' => 0,
            'total_spent' => 0,
            'total_deposit' => 0,
        ]);

        $balanceRow = UserBalance::query()
            ->where('user_id', $order->user_id)
            ->lockForUpdate()
            ->first();

        if (! $balanceRow) {
            return false;
        }

        $balanceBefore = (int) $balanceRow->balance;
        $balanceAfter = $balanceBefore + $amount;

        $balanceRow->balance = $balanceAfter;

        $spent = (int) $balanceRow->total_spent;
        $balanceRow->total_spent = $spent >= $amount ? $spent - $amount : 0;

        $balanceRow->save();

        WalletLedgerWriter::record(
            (int) $order->user_id,
            'credit',
            (int) $amount,
            (int) $balanceBefore,
            (int) $balanceAfter,
            'order',
            (string) $order->id,
            $reason,
            [
                'order_id' => (int) $order->id,
                'status' => (string) ($order->status ?? ''),
            ],
            now(),
        );

        $order->refunded_at = now();
        $order->save();

        return true;
    }
}
