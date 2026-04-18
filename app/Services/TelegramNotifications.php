<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\Order;
use App\Models\Suggestion;
use App\Models\User;
use Illuminate\Support\Arr;
use Throwable;

final class TelegramNotifications
{
    private static function wib(?\DateTimeInterface $dt): string
    {
        if (! $dt) {
            return '-';
        }

        try {
            return (new \Carbon\Carbon($dt))->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s')." WIB";
        } catch (Throwable) {
            return '-';
        }
    }

    private static function userLabel(?User $user): string
    {
        if (! $user) {
            return 'User #-';
        }

        $label = trim((string) ($user->name ?? ''));
        if ($label === '') {
            $label = trim((string) ($user->email ?? ''));
        }
        if ($label === '') {
            $label = 'User #'.(string) $user->id;
        }

        return $label;
    }

    public static function registration(User $user): bool
    {
        try {
            return TelegramNotifier::sendMessage(
                "[Registrasi] Member baru\n".
                'ID: #'.(int) $user->id."\n".
                'Nama: '.(string) ($user->name ?? '-')."\n".
                'Email: '.(string) ($user->email ?? '-')."\n".
                'HP: '.(string) ($user->phone ?? '-')."\n".
                'Tanggal: '.self::wib($user->created_at)
            );
        } catch (Throwable) {
            return false;
        }
    }

    public static function orderCreated(Order $order, ?User $user = null): bool
    {
        try {
            $user = $user ?? $order->user;

            $target = trim((string) ($order->target ?? ''));
            if (mb_strlen($target) > 500) {
                $target = mb_substr($target, 0, 500).'…';
            }

            return TelegramNotifier::sendMessage(
                "[Order Masuk] Pesanan baru\n".
                'Tanggal: '.self::wib($order->created_at)."\n".
                'Order ID: #'.(int) $order->id."\n".
                'Provider ID: '.(string) ($order->provider_order_id ?? '-')."\n".
                'User: '.self::userLabel($user)."\n".
                'Email: '.(string) ($user?->email ?? '-')."\n".
                'HP: '.(string) ($user?->phone ?? '-')."\n".
                'Layanan: '.(string) ($order->service_name ?? '-')."\n".
                'Qty: '.(int) ($order->quantity ?? 0)."\n".
                'Total: '.(int) ($order->total_price ?? 0)."\n".
                'Target: '.$target."\n".
                'Status: '.(string) ($order->status ?? '-')
            );
        } catch (Throwable) {
            return false;
        }
    }

    public static function depositSuccess(Deposit $deposit, ?User $user = null): bool
    {
        try {
            $user = $user ?? $deposit->user;

            $method = (string) ($deposit->payment_method ?? '-');
            $providerPayload = is_array($deposit->provider_payload) ? $deposit->provider_payload : [];

            $reference = (string) (Arr::get($providerPayload, 'order_id')
                ?? Arr::get($providerPayload, 'data.reference')
                ?? Arr::get($providerPayload, 'data.merchant_ref')
                ?? Arr::get($providerPayload, 'merchant_ref')
                ?? Arr::get($providerPayload, 'reference')
                ?? '-');

            return TelegramNotifier::sendMessage(
                "[Deposit Masuk] Deposit SUCCESS\n".
                'Tanggal: '.self::wib($deposit->processed_at ?? $deposit->created_at)."\n".
                'Deposit ID: #'.(int) $deposit->id."\n".
                'User: '.self::userLabel($user)."\n".
                'Email: '.(string) ($user?->email ?? '-')."\n".
                'HP: '.(string) ($user?->phone ?? '-')."\n".
                'Metode: '.$method."\n".
                'Referensi: '.$reference."\n".
                'Nominal: '.(int) ($deposit->amount ?? 0)."\n".
                'Final: '.(int) ($deposit->final_amount ?? 0)
            );
        } catch (Throwable) {
            return false;
        }
    }

    public static function suggestionSubmitted(Suggestion $suggestion, ?User $user = null): bool
    {
        try {
            $user = $user ?? $suggestion->user;

            $message = trim((string) ($suggestion->message ?? ''));
            if (mb_strlen($message) > 800) {
                $message = mb_substr($message, 0, 800).'…';
            }

            return TelegramNotifier::sendMessage(
                "[Kotak Saran] Pesan masuk\n".
                'Tanggal: '.self::wib($suggestion->created_at)."\n".
                'ID: #'.(int) $suggestion->id."\n".
                'User ID: #'.(int) ($suggestion->user_id ?? 0)."\n".
                'Nama: '.(string) ($suggestion->name ?? '-')."\n".
                'Email: '.(string) ($user?->email ?? '-')."\n".
                'HP: '.(string) ($suggestion->phone ?? '-')."\n".
                'Kategori: '.(string) ($suggestion->category ?? '-')."\n".
                'Pesan: '.$message
            );
        } catch (Throwable) {
            return false;
        }
    }
}
