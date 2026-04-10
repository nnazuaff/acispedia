<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\ServicePolicy;
use App\Services\MedanpediaClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class MedanpediaController extends Controller
{
    private static function maskThirdPartyName(string $message): string
    {
        $message = trim($message);
        if ($message === '') {
            return $message;
        }

        $message = preg_replace('/\b(tripay|medanpedia)\b/i', '', $message) ?? $message;
        $message = preg_replace('/\s{2,}/', ' ', $message) ?? $message;
        $message = trim($message, " \t\n\r\0\x0B:-");

        return $message;
    }

    public function service(int $id, MedanpediaClient $client): JsonResponse
    {
        $cacheKey = 'medanpedia.services_raw';
        $ttlSeconds = (int) config('medanpedia.services_cache_ttl', 300);

        $rawServices = Cache::get($cacheKey);

        if (! is_array($rawServices)) {
            $api = $client->getServices();

            if (($api['status'] ?? false) && isset($api['data']) && is_array($api['data'])) {
                $rawServices = $this->normalizeServicesList($api['data']);
                Cache::put($cacheKey, $rawServices, $ttlSeconds);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => self::maskThirdPartyName((string) ($api['msg'] ?? 'Gagal memuat layanan dari penyedia layanan.')),
                ], 500);
            }
        }

        $found = null;
        foreach ($rawServices as $service) {
            if (! is_array($service)) {
                continue;
            }

            $sid = $service['id'] ?? ($service['service'] ?? ($service['service_id'] ?? null));
            if ($sid !== null && is_scalar($sid) && (int) $sid === $id) {
                $found = $service;
                break;
            }
        }

        if (! $found) {
            return response()->json([
                'success' => false,
                'message' => 'Service tidak ditemukan.',
            ], 404);
        }

        if (ServicePolicy::isDisallowed($found)) {
            return response()->json([
                'success' => false,
                'message' => 'Service tidak ditemukan.',
            ], 404);
        }

        $markup = AppSetting::getInt('smm_markup_amount', (int) config('medanpedia.markup_amount', 200));

        $category = isset($found['category']) && trim((string) $found['category']) !== ''
            ? (string) $found['category']
            : 'Other';

        $price = $found['price'] ?? ($found['rate'] ?? 0);
        $priceNum = is_numeric($price) ? (float) $price : 0.0;

        $payload = [
            'success' => true,
            'service' => [
                'id' => (int) $id,
                'name' => (string) ($found['name'] ?? ($found['service_name'] ?? ($found['title'] ?? ''))),
                'description' => isset($found['description'])
                    ? (string) $found['description']
                    : 'Tidak ada deskripsi tersedia',
                'category' => $category,
                'price' => $priceNum,
                'min' => isset($found['min']) ? (int) $found['min'] : 1,
                'max' => isset($found['max']) ? (int) $found['max'] : 10000,
                'average_time' => isset($found['average_time']) ? (string) $found['average_time'] : null,
                'price_formatted' => 'Rp '.number_format((float) ($priceNum + $markup), 0, ',', '.'),
                'price_with_markup' => (float) ($priceNum + $markup),
            ],
            'markup_amount' => $markup,
        ];

        return response()->json($payload);
    }

    public function profile(MedanpediaClient $client): JsonResponse
    {
        $result = $client->getProfile();

        if (! ($result['status'] ?? false)) {
            return response()->json([
                'success' => false,
                'message' => self::maskThirdPartyName((string) ($result['msg'] ?? 'Gagal mengambil data profil penyedia layanan.')),
            ], 500);
        }

        $balance = data_get($result, 'data.balance');

        if (! is_numeric($balance)) {
            $balance = data_get($result, 'data.saldo');
        }

        $balanceNum = is_numeric($balance) ? (float) $balance : null;

        return response()->json([
            'success' => true,
            'balance' => $balanceNum,
            'balance_formatted' => $balanceNum === null
                ? null
                : 'Rp '.number_format((float) $balanceNum, 0, ',', '.'),
            'raw' => [
                'status' => (bool) ($result['status'] ?? false),
                'msg' => isset($result['msg']) && is_string($result['msg'])
                    ? self::maskThirdPartyName($result['msg'])
                    : ($result['msg'] ?? null),
            ],
        ]);
    }

    public function services(Request $request, MedanpediaClient $client): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $categoryFilter = trim((string) $request->query('category', ''));
        $sort = trim((string) $request->query('sort', ''));
        $refresh = $request->boolean('refresh');
        $obfuscate = $request->boolean('obf');

        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $page = (int) $request->query('page', 1);
        if ($page < 1) {
            $page = 1;
        }

        $cacheKey = 'medanpedia.services_raw';
        $ttlSeconds = (int) config('medanpedia.services_cache_ttl', 300);

        $rawServices = null;
        $cacheHit = false;

        if (! $refresh) {
            $cached = Cache::get($cacheKey);
            if (is_array($cached)) {
                $rawServices = $this->normalizeServicesList($cached);
                $cacheHit = true;
            }
        }

        if (! is_array($rawServices)) {
            $api = $client->getServices();

            if (($api['status'] ?? false) && isset($api['data']) && is_array($api['data'])) {
                $rawServices = $this->normalizeServicesList($api['data']);
                Cache::put($cacheKey, $rawServices, $ttlSeconds);
            } else {
                $stale = Cache::get($cacheKey);
                if (is_array($stale)) {
                    $rawServices = $this->normalizeServicesList($stale);
                } else {
                    $payload = [
                        'success' => false,
                        'message' => self::maskThirdPartyName((string) ($api['msg'] ?? 'Gagal memuat layanan dari penyedia layanan.')),
                    ];

                    return $this->maybeObfuscate($payload, $obfuscate, 500);
                }
            }
        }

        $flat = [];
        foreach ($rawServices as $service) {
            if (! is_array($service)) {
                continue;
            }

            $sid = $service['id'] ?? ($service['service'] ?? ($service['service_id'] ?? null));
            $sname = $service['name'] ?? ($service['service_name'] ?? ($service['title'] ?? null));

            if ($sid === null || $sid === '' || ! is_scalar($sid)) {
                continue;
            }
            if ($sname === null || trim((string) $sname) === '') {
                continue;
            }

            $category = isset($service['category']) && trim((string) $service['category']) !== ''
                ? (string) $service['category']
                : 'Other';

            $desc = isset($service['description']) ? (string) $service['description'] : '';

            if (ServicePolicy::isDisallowed([
                'name' => (string) $sname,
                'category' => $category,
                'description' => $desc,
            ])) {
                continue;
            }

            $price = $service['price'] ?? ($service['rate'] ?? 0);
            $priceNum = is_numeric($price) ? (float) $price : 0.0;

            $flat[] = [
                'id' => (int) $sid,
                'name' => (string) $sname,
                'description' => $desc !== '' ? $desc : 'Tidak ada deskripsi tersedia',
                'price' => $priceNum,
                'min' => isset($service['min']) ? (int) $service['min'] : 1,
                'max' => isset($service['max']) ? (int) $service['max'] : 10000,
                'average_time' => isset($service['average_time']) ? (string) $service['average_time'] : null,
                'category' => $category,
            ];
        }

        $qLower = $q !== '' ? mb_strtolower($q) : '';

        if ($qLower !== '') {
            $flat = array_values(array_filter($flat, function (array $s) use ($qLower) {
                $nameMatch = str_contains(mb_strtolower($s['name']), $qLower);
                $catMatch = str_contains(mb_strtolower($s['category']), $qLower);

                return $nameMatch || $catMatch;
            }));
        }

        if ($categoryFilter !== '') {
            $flat = array_values(array_filter($flat, fn (array $s) => $s['category'] === $categoryFilter));
        }

        switch ($sort) {
            case 'price_asc':
                usort($flat, fn ($a, $b) => $a['price'] <=> $b['price']);
                break;
            case 'price_desc':
                usort($flat, fn ($a, $b) => $b['price'] <=> $a['price']);
                break;
            case 'name_asc':
                usort($flat, fn ($a, $b) => strcasecmp($a['name'], $b['name']));
                break;
            case 'name_desc':
                usort($flat, fn ($a, $b) => strcasecmp($b['name'], $a['name']));
                break;
        }

        $totalAfterFilter = count($flat);
        $totalPages = $totalAfterFilter > 0 ? (int) ceil($totalAfterFilter / $perPage) : 0;
        if ($totalPages > 0 && $page > $totalPages) {
            $page = $totalPages;
        }

        $offset = ($page - 1) * $perPage;
        $paged = $totalAfterFilter ? array_slice($flat, $offset, $perPage) : [];

        $categories = [];
        foreach ($flat as $s) {
            $key = strtolower(str_replace([' ', '-', '_'], '', (string) $s['category']));
            $categories[$key] = (string) $s['category'];
        }

        $markup = AppSetting::getInt('smm_markup_amount', (int) config('medanpedia.markup_amount', 200));

        $groupedServices = [];
        foreach ($paged as $service) {
            $categoryKey = strtolower(str_replace([' ', '-', '_'], '', (string) $service['category']));
            $groupedServices[$categoryKey] ??= [];

            $groupedServices[$categoryKey][] = [
                ...$service,
                'price_formatted' => 'Rp '.number_format((float) ($service['price'] + $markup), 0, ',', '.'),
                'price_with_markup' => (float) ($service['price'] + $markup),
                '_price_num' => (float) $service['price'],
            ];
        }

        $payload = [
            'success' => true,
            'services' => $groupedServices,
            'categories' => $categories,
            'markup_amount' => $markup,
            'total_services' => count($rawServices),
            'valid_services' => $totalAfterFilter,
            'shown_services' => array_sum(array_map('count', $groupedServices)),
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => $totalPages,
            'cached' => $cacheHit,
        ];

        return $this->maybeObfuscate($payload, $obfuscate);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function maybeObfuscate(array $payload, bool $obfuscate, int $status = 200): JsonResponse
    {
        if (! $obfuscate) {
            return response()->json($payload, $status);
        }

        $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            return response()->json([
                'encoding' => 'b64json',
                'payload' => base64_encode('{"success":false,"message":"Gagal encode payload."}'),
            ], $status);
        }

        return response()->json([
            'encoding' => 'b64json',
            'payload' => base64_encode($json),
        ], $status);
    }

    /**
     * @param  array<mixed>  $decoded
     * @return array<int, mixed>
     */
    private function normalizeServicesList(array $decoded): array
    {
        if (isset($decoded['data']) && is_array($decoded['data'])) {
            return $this->normalizeServicesList($decoded['data']);
        }

        if (Arr::isList($decoded)) {
            return $decoded;
        }

        $values = array_values($decoded);

        return Arr::isList($values) ? $values : $values;
    }
}
