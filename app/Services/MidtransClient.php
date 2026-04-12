<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class MidtransClient
{
    public static function isEnabled(): bool
    {
        return (bool) config('midtrans.enabled', false);
    }

    public static function isProduction(): bool
    {
        return strtolower((string) config('midtrans.env', 'sandbox')) === 'production';
    }

    public static function isConfigured(): bool
    {
        return trim((string) config('midtrans.server_key')) !== '';
    }

    public static function serverKey(): string
    {
        $serverKey = trim((string) config('midtrans.server_key', ''));

        if ($serverKey === '') {
            throw new RuntimeException('Midtrans Server Key belum dikonfigurasi.');
        }

        return $serverKey;
    }

    public static function snapApiBase(): string
    {
        return self::isProduction()
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    public static function snapJsUrl(): string
    {
        return self::isProduction()
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    public static function notificationExpectedSignature(string $orderId, string $statusCode, string $grossAmount): string
    {
        return hash('sha512', $orderId.$statusCode.$grossAmount.self::serverKey());
    }

    /**
     * @param  array<string, mixed>  $customerDetails
     * @param  array<int, array<string, mixed>>  $itemDetails
     * @param  array<string, string>  $callbacks
     * @param  array<int, string>  $enabledPayments
     * @return array<string, mixed>
     */
    public static function createTransaction(
        string $orderId,
        int $grossAmount,
        array $customerDetails = [],
        array $itemDetails = [],
        array $callbacks = [],
        array $enabledPayments = []
    ): array {
        if (! self::isEnabled()) {
            throw new RuntimeException('Metode pembayaran Midtrans sedang dinonaktifkan sementara.');
        }

        if (! self::isConfigured()) {
            throw new RuntimeException('Midtrans belum dikonfigurasi.');
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'credit_card' => [
                'secure' => true,
            ],
            'custom_expiry' => [
                'unit' => 'day',
                'duration' => 1,
            ],
        ];

        if ($customerDetails !== []) {
            $payload['customer_details'] = $customerDetails;
        }

        if ($itemDetails !== []) {
            $payload['item_details'] = $itemDetails;
        }

        if ($enabledPayments !== []) {
            $payload['enabled_payments'] = array_values($enabledPayments);
        }

        $resolvedCallbacks = array_filter([
            'finish' => trim((string) ($callbacks['finish'] ?? config('midtrans.finish_url', ''))),
            'unfinish' => trim((string) ($callbacks['unfinish'] ?? config('midtrans.unfinish_url', ''))),
            'error' => trim((string) ($callbacks['error'] ?? config('midtrans.error_url', ''))),
        ]);

        if ($resolvedCallbacks !== []) {
            $payload['callbacks'] = $resolvedCallbacks;
        }

        $response = Http::acceptJson()
            ->withBasicAuth(self::serverKey(), '')
            ->timeout((int) config('midtrans.timeout', 30))
            ->post(self::snapApiBase(), $payload);

        $json = $response->json();
        if (! is_array($json)) {
            throw new RuntimeException('Respon Midtrans tidak valid.');
        }

        if (! $response->successful()) {
            $message = (string) (Arr::get($json, 'status_message') ?? Arr::get($json, 'message') ?? 'Midtrans error');
            throw new RuntimeException('Midtrans error: '.$message);
        }

        return $json;
    }
}