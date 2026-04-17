<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Throwable;

class MedanpediaClient
{
    private ?string $apiId;

    private ?string $apiKey;

    private string $baseUrl;

    private int $timeout;

    private bool $forceIpv4;

    private bool $autoIpv4Fallback;

    private int $maxSafeTotalSeconds;

    private function maskVendorName(string $message): string
    {
        $message = trim($message);
        if ($message === '') {
            return $message;
        }

        $message = preg_replace('/\bmedanpedia\b/i', '', $message) ?? $message;
        $message = preg_replace('/\s{2,}/', ' ', $message) ?? $message;
        $message = trim($message, " \t\n\r\0\x0B:-");

        return $message;
    }

    public function __construct()
    {
        $this->apiId = config('medanpedia.api_id');
        $this->apiKey = config('medanpedia.api_key');
        $this->baseUrl = rtrim((string) config('medanpedia.base_url'), '/');
        $this->timeout = (int) config('medanpedia.timeout');
        $this->forceIpv4 = (bool) config('medanpedia.force_ipv4');
        $this->autoIpv4Fallback = (bool) config('medanpedia.auto_ipv4_fallback');

        // Keep enough headroom under common PHP max_execution_time=30.
        // This matters when auto IPv4 fallback triggers a second HTTP attempt.
        $this->maxSafeTotalSeconds = 25;
    }

    public function isConfigured(): bool
    {
        return filled($this->apiId) && filled($this->apiKey) && filled($this->baseUrl);
    }

    /**
     * @return array{status: bool, msg?: string, data?: mixed, debug?: mixed}
     */
    public function getProfile(): array
    {
        return $this->postJson('/profile', []);
    }

    /**
     * @return array{status: bool, msg?: string, data?: mixed, debug?: mixed}
     */
    public function getServices(): array
    {
        return $this->postJson('/services', []);
    }

    /**
     * @return array{status: bool, msg?: string, data?: mixed, debug?: mixed}
     */
    public function createOrder(int $serviceId, string $target, int $quantity, ?string $comments = null): array
    {
        $payload = [
            'service' => $serviceId,
            'target' => $target,
            'quantity' => $quantity,
        ];

        if ($comments !== null && trim($comments) !== '') {
            $payload['comments'] = $comments;
        }

        return $this->postJson('/order', $payload);
    }

    /**
     * @return array{status: bool, msg?: string, data?: mixed, debug?: mixed}
     */
    public function getOrderStatus(string|int $providerOrderId): array
    {
        return $this->postJson('/status', [
            'id' => (string) $providerOrderId,
        ]);
    }

    /**
     * Bulk status check (maks 50 ID per request).
     *
     * @param  array<int, string|int>  $providerOrderIds
     * @return array{status: bool, msg?: string, data?: mixed, debug?: mixed}
     */
    public function getOrdersStatusBulk(array $providerOrderIds): array
    {
        $ids = array_values(array_filter(array_unique(array_map(static fn ($v) => trim((string) $v), $providerOrderIds)), static fn ($v) => $v !== ''));

        if ($ids === []) {
            return [
                'status' => false,
                'msg' => 'No provider IDs supplied.',
            ];
        }

        $ids = array_slice($ids, 0, 50);

        return $this->postJson('/status', [
            'id' => implode(',', $ids),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{status: bool, msg?: string, data?: mixed, debug?: mixed}
     */
    private function postJson(string $path, array $data): array
    {
        if (! $this->isConfigured()) {
            return [
                'status' => false,
                'msg' => 'Integrasi penyedia layanan belum dikonfigurasi.',
            ];
        }

        $payload = [
            ...$data,
            'api_id' => $this->apiId,
            'api_key' => $this->apiKey,
        ];

        $url = $this->baseUrl.$path;

        $attempts = ($this->forceIpv4 || ! $this->autoIpv4Fallback) ? 1 : 2;

        $timeoutPerAttempt = $this->timeout;
        if ($attempts > 1) {
            $timeoutPerAttempt = (int) floor($this->maxSafeTotalSeconds / $attempts);
        }

        if ($timeoutPerAttempt < 5) {
            $timeoutPerAttempt = 5;
        }
        if ($timeoutPerAttempt > $this->timeout) {
            $timeoutPerAttempt = $this->timeout;
        }

        $lastError = null;

        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            $shouldForceIpv4 = $this->forceIpv4 || ($attempt === 2 && $this->autoIpv4Fallback);

            try {
                $response = $this->request($shouldForceIpv4, $timeoutPerAttempt)->post($url, $payload);
            } catch (Throwable $e) {
                $lastError = [
                    'status' => false,
                    'msg' => 'HTTP Client Error: '.$e->getMessage(),
                    'debug' => [
                        'url' => $url,
                        'attempt' => $attempt,
                        'forced_ipv4' => $shouldForceIpv4,
                        'timeout' => $timeoutPerAttempt,
                        'exception' => get_class($e),
                    ],
                ];

                if (! $this->forceIpv4 && $this->autoIpv4Fallback && $attempt === 1) {
                    continue;
                }

                break;
            }

            if (! $response->ok()) {
                $body = (string) $response->body();

                $errorMsg = match ($response->status()) {
                    400 => 'Permintaan ke provider ditolak (HTTP 400). Parameter/format order tidak valid.',
                    402 => 'Order ditolak provider (HTTP 402). Biasanya karena saldo API tidak cukup atau parameter order tidak valid.',
                    403 => 'Akses ke provider ditolak (HTTP 403). Cek whitelist IP dan kredensial API.',
                    404 => 'Endpoint provider tidak ditemukan (HTTP 404). Cek base URL/endpoint.',
                    500 => 'Provider sedang bermasalah (HTTP 500). Coba lagi beberapa saat.',
                    default => 'Terjadi error dari provider (HTTP '.$response->status().').',
                };

                $ipBlockedDetected = $response->status() === 403
                    && (str_contains(mb_strtolower($body), 'not allowed') || str_contains(mb_strtolower($body), 'tidak diizinkan'));

                $lastError = [
                    'status' => false,
                    'msg' => $errorMsg,
                    'debug' => [
                        'http_code' => $response->status(),
                        'url' => $url,
                        'attempt' => $attempt,
                        'forced_ipv4' => $shouldForceIpv4,
                        'timeout' => $timeoutPerAttempt,
                        'ip_blocked_detected' => $ipBlockedDetected,
                        'response' => $body,
                    ],
                ];

                if ($ipBlockedDetected && ! $this->forceIpv4 && $this->autoIpv4Fallback && $attempt === 1) {
                    continue;
                }

                break;
            }

            $decoded = $response->json();

            if (! is_array($decoded)) {
                $lastError = [
                    'status' => false,
                    'msg' => 'JSON Decode Error: response bukan JSON object/array.',
                    'debug' => [
                        'url' => $url,
                        'attempt' => $attempt,
                        'forced_ipv4' => $shouldForceIpv4,
                        'timeout' => $timeoutPerAttempt,
                        'raw_response' => (string) $response->body(),
                    ],
                ];

                break;
            }

            if ($attempt === 2 && $this->autoIpv4Fallback) {
                $decoded['fallback_used'] = 'ipv4';
            }

            if (isset($decoded['msg']) && is_string($decoded['msg'])) {
                $decoded['msg'] = $this->maskVendorName($decoded['msg']);
            }

            return $decoded;
        }

        return $lastError ?? [
            'status' => false,
            'msg' => 'Request gagal.',
        ];
    }

    private function request(bool $forceIpv4, int $timeoutSeconds): PendingRequest
    {
        $request = Http::asForm()
            ->acceptJson()
            ->connectTimeout(min(5, $timeoutSeconds))
            ->timeout($timeoutSeconds)
            ->withHeaders([
                'User-Agent' => 'AcisPedia SMM Panel/1.0',
            ]);

        if ($forceIpv4 && defined('CURLOPT_IPRESOLVE') && defined('CURL_IPRESOLVE_V4')) {
            $request = $request->withOptions([
                'curl' => [
                    CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                ],
            ]);
        }

        return $request;
    }
}
