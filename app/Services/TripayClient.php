<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class TripayClient
{
    public static function isProduction(): bool
    {
        return strtolower((string) config('tripay.env', 'sandbox')) === 'production';
    }

    public static function apiBase(): string
    {
        return self::isProduction()
            ? 'https://tripay.co.id/api/'
            : 'https://tripay.co.id/api-sandbox/';
    }

    public static function isConfigured(): bool
    {
        return trim((string) config('tripay.api_key')) !== ''
            && trim((string) config('tripay.private_key')) !== ''
            && trim((string) config('tripay.merchant_code')) !== '';
    }

    public static function requestSignature(string $merchantRef, int $amount): string
    {
        $privateKey = (string) config('tripay.private_key');
        $merchantCode = (string) config('tripay.merchant_code');

        if (trim($privateKey) === '' || trim($merchantCode) === '') {
            throw new RuntimeException('Tripay belum dikonfigurasi.');
        }

        return hash_hmac('sha256', $merchantCode.$merchantRef.$amount, $privateKey);
    }

    public static function callbackExpectedSignature(string $rawBody): string
    {
        $privateKey = (string) config('tripay.private_key');

        if (trim($privateKey) === '') {
            throw new RuntimeException('Tripay belum dikonfigurasi.');
        }

        return hash_hmac('sha256', $rawBody, $privateKey);
    }

    /**
     * @param  array{name:string,email?:string,phone:string}  $customer
     * @param  array<int, array{sku:string,name:string,price:int,quantity:int}>  $items
     * @return array<string, mixed>
     */
    public static function createTransaction(string $merchantRef, int $amount, string $method, array $customer, array $items): array
    {
        if (! self::isConfigured()) {
            throw new RuntimeException('Payment gateway belum dikonfigurasi.');
        }

        $timeout = (int) config('tripay.timeout', 30);

        $appUrl = rtrim((string) config('app.url', ''), '/');
        $callbackUrl = trim((string) config('tripay.callback_url', ''));
        $returnUrl = trim((string) config('tripay.return_url', ''));

        if ($callbackUrl === '' && $appUrl !== '') {
            $callbackUrl = $appUrl.'/api/tripay/callback';
        }

        if ($returnUrl === '' && $appUrl !== '') {
            $returnUrl = $appUrl.'/history/deposit';
        }

        $payload = [
            'method' => $method,
            'merchant_ref' => $merchantRef,
            'amount' => $amount,
            'customer_name' => (string) ($customer['name'] ?? ''),
            'customer_email' => (string) ($customer['email'] ?? ''),
            'customer_phone' => (string) ($customer['phone'] ?? ''),
            'order_items' => $items,
            'callback_url' => $callbackUrl,
            'return_url' => $returnUrl,
            'signature' => self::requestSignature($merchantRef, $amount),
        ];

        $resp = Http::asForm()
            ->acceptJson()
            ->withToken((string) config('tripay.api_key'))
            ->timeout($timeout)
            ->post(rtrim(self::apiBase(), '/').'/transaction/create', $payload);

        $json = $resp->json();
        if (! is_array($json)) {
            throw new RuntimeException('Respon Tripay tidak valid.');
        }

        if (! $resp->successful()) {
            $msg = (string) (Arr::get($json, 'message') ?? Arr::get($json, 'error') ?? 'Tripay error');
            throw new RuntimeException('Tripay error: '.$msg);
        }

        return $json;
    }
}
