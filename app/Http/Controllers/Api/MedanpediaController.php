<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\MedanpediaClient;
use App\Services\ServicePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class MedanpediaController extends Controller
{
    private static function normalizeCategoryLabel(string $category): string
    {
        $trimmed = trim($category);
        if ($trimmed === '') {
            return $trimmed;
        }

        $lower = mb_strtolower($trimmed);

        // Provider sometimes returns a combined marketplace label even though services belong to Shopee.
        // Example: "Shopee/Tokopedia/Bukalapak/Lazada".
        if (
            str_contains($lower, 'shopee')
            && (str_contains($lower, 'tokopedia') || str_contains($lower, 'bukalapak') || str_contains($lower, 'lazada'))
        ) {
            return 'Shopee';
        }

        return $trimmed;
    }

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

    private static function parseAverageTimeToSeconds(?string $averageTime): ?int
    {
        if ($averageTime === null) {
            return null;
        }

        $normalized = preg_replace('/\s+/u', ' ', mb_strtolower(trim($averageTime)));
        if (! is_string($normalized) || $normalized === '') {
            return null;
        }

        foreach ([
            '/waktu\s+proses\s+rata-?rata\s*:?\s*(.+)$/u',
            '/average\s+processing\s+time\s*:?\s*(.+)$/u',
            '/average\s+time\s*:?\s*(.+)$/u',
        ] as $pattern) {
            if (preg_match($pattern, $normalized, $matches) === 1) {
                $normalized = trim((string) ($matches[1] ?? ''));
                break;
            }
        }

        if ($normalized === '') {
            return null;
        }

        preg_match_all(
            '/(\d+)\s*(hari|jam|menit|detik|day|days|hour|hours|hr|hrs|minute|minutes|min|mins|second|seconds|sec|secs)\b/u',
            $normalized,
            $matches,
            PREG_SET_ORDER,
        );

        if ($matches === []) {
            return null;
        }

        $seconds = 0;

        foreach ($matches as $match) {
            $value = (int) ($match[1] ?? 0);
            $unit = (string) ($match[2] ?? '');

            switch ($unit) {
                case 'hari':
                case 'day':
                case 'days':
                    $seconds += $value * 86400;
                    break;
                case 'jam':
                case 'hour':
                case 'hours':
                case 'hr':
                case 'hrs':
                    $seconds += $value * 3600;
                    break;
                case 'menit':
                case 'minute':
                case 'minutes':
                case 'min':
                case 'mins':
                    $seconds += $value * 60;
                    break;
                case 'detik':
                case 'second':
                case 'seconds':
                case 'sec':
                case 'secs':
                    $seconds += $value;
                    break;
            }
        }

        return $seconds;
    }

    private static function resolveCategoryGroup(string $category): string
    {
        $normalized = mb_strtolower(trim($category));

        if ($normalized === '') {
            return 'lainnya';
        }

        $checks = [
            'instagram_followers' => ['instagram follower', 'instagram followers'],
            'instagram' => ['instagram'],
            'facebook' => ['facebook', 'fb '],
            'youtube' => ['youtube', 'yt '],
            'twitter' => ['twitter', 'x - twitter', 'x/twitter', 'x twitter'],
            'spotify' => ['spotify'],
            'tiktok' => ['tiktok', 'tik tok'],
            'linkedin' => ['linkedin'],
            'telegram' => ['telegram'],
            'thread' => ['thread', 'threads'],
            'web_traffic' => ['web traffic', 'traffic website', 'website traffic', 'web visitor'],
        ];

        foreach ($checks as $group => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($normalized, $keyword)) {
                    return $group;
                }
            }
        }

        return 'lainnya';
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
            ? self::normalizeCategoryLabel((string) $found['category'])
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
        $groupFilter = trim((string) $request->query('group', ''));
        $categoryFilter = trim((string) $request->query('category', ''));
        $sort = trim((string) $request->query('sort', ''));
        $refresh = $request->boolean('refresh');
        $obfuscate = $request->boolean('obf');

        $perPage = (int) $request->query('per_page', 25);
        if (! in_array($perPage, [25, 50, 100, 200], true)) {
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
                ? self::normalizeCategoryLabel((string) $service['category'])
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
                $searchableText = mb_strtolower(trim($s['name'].' '.$s['description']));

                return str_contains($searchableText, $qLower);
            }));
        }

        if ($groupFilter !== '') {
            $flat = array_values(array_filter($flat, function (array $s) use ($groupFilter) {
                return self::resolveCategoryGroup((string) ($s['category'] ?? '')) === $groupFilter;
            }));
        }

        $categories = [];
        foreach ($flat as $s) {
            $key = strtolower(str_replace([' ', '-', '_'], '', (string) $s['category']));
            $categories[$key] = (string) $s['category'];
        }

        natcasesort($categories);

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
            case 'time_asc':
                usort($flat, function (array $a, array $b): int {
                    $aSeconds = self::parseAverageTimeToSeconds($a['average_time'] ?? null);
                    $bSeconds = self::parseAverageTimeToSeconds($b['average_time'] ?? null);

                    if ($aSeconds === null && $bSeconds === null) {
                        return strcasecmp($a['name'], $b['name']);
                    }

                    if ($aSeconds === null) {
                        return 1;
                    }

                    if ($bSeconds === null) {
                        return -1;
                    }

                    if ($aSeconds === $bSeconds) {
                        return strcasecmp($a['name'], $b['name']);
                    }

                    return $aSeconds <=> $bSeconds;
                });
                break;
        }

        $totalAfterFilter = count($flat);
        $totalPages = $totalAfterFilter > 0 ? (int) ceil($totalAfterFilter / $perPage) : 0;
        if ($totalPages > 0 && $page > $totalPages) {
            $page = $totalPages;
        }

        $offset = ($page - 1) * $perPage;
        $paged = $totalAfterFilter ? array_slice($flat, $offset, $perPage) : [];

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
