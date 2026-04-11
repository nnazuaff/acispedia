<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class AcispayClient
{
    public static function isConfigured(): bool
    {
        return trim((string) config('acispay.base_url')) !== ''
            && trim((string) config('acispay.api_token')) !== '';
    }

    private static function baseUrl(): string
    {
        return rtrim((string) config('acispay.base_url', ''), '/');
    }

    private static function timeout(): int
    {
        $timeout = (int) config('acispay.timeout', 15);

        return $timeout > 0 ? $timeout : 15;
    }

    private static function endpoint(string $path): string
    {
        $base = self::baseUrl();
        $path = '/'.ltrim($path, '/');

        return $base.$path;
    }

    private static function errorMessageFromJson(array $json, string $fallback): string
    {
        $msg = (string) (Arr::get($json, 'message') ?? Arr::get($json, 'error') ?? '');
        $msg = trim($msg);

        return $msg !== '' ? $msg : $fallback;
    }

    /**
     * @return array{balance:int, raw:array<string,mixed>}
     */
    public static function checkBalance(string $phone, string $username): array
    {
        if (! self::isConfigured()) {
            throw new RuntimeException('Konversi saldo belum dikonfigurasi.');
        }

        $phone = trim($phone);
        $username = trim($username);

        if ($phone === '' || $username === '') {
            throw new RuntimeException('Data AcisPay tidak lengkap.');
        }

        $url = self::endpoint((string) config('acispay.check_balance_path'));

        $resp = Http::acceptJson()
            ->withToken((string) config('acispay.api_token'))
            ->timeout(self::timeout())
            ->post($url, [
                'phone' => $phone,
                'username' => $username,
            ]);

        $json = $resp->json();
        if (! is_array($json)) {
            throw new RuntimeException('Respon AcisPay tidak valid.');
        }

        if (! $resp->successful()) {
            throw new RuntimeException(self::errorMessageFromJson($json, 'Gagal memeriksa saldo AcisPay.'));
        }

        $balanceRaw = Arr::get($json, 'balance');
        if (! is_numeric($balanceRaw)) {
            $balanceRaw = Arr::get($json, 'data.balance');
        }

        if (! is_numeric($balanceRaw)) {
            throw new RuntimeException('Respon saldo AcisPay tidak valid.');
        }

        return [
            'balance' => (int) $balanceRaw,
            'raw' => $json,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function transfer(string $phone, string $username, int $amount, string $idempotencyKey): array
    {
        if (! self::isConfigured()) {
            throw new RuntimeException('Konversi saldo belum dikonfigurasi.');
        }

        $phone = trim($phone);
        $username = trim($username);

        if ($phone === '' || $username === '' || $amount < 1) {
            throw new RuntimeException('Data transfer AcisPay tidak valid.');
        }

        $url = self::endpoint((string) config('acispay.transfer_path'));

        $resp = Http::acceptJson()
            ->withToken((string) config('acispay.api_token'))
            ->withHeaders([
                'Idempotency-Key' => $idempotencyKey,
            ])
            ->timeout(self::timeout())
            ->post($url, [
                'phone' => $phone,
                'username' => $username,
                'amount' => $amount,
                'reference' => $idempotencyKey,
            ]);

        $json = $resp->json();
        if (! is_array($json)) {
            throw new RuntimeException('Respon AcisPay tidak valid.');
        }

        if (! $resp->successful()) {
            throw new RuntimeException(self::errorMessageFromJson($json, 'Gagal memproses konversi saldo.'));
        }

        $success = Arr::get($json, 'success');
        if (is_bool($success) && $success === false) {
            throw new RuntimeException(self::errorMessageFromJson($json, 'Gagal memproses konversi saldo.'));
        }

        return $json;
    }
}
