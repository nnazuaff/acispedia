<?php

namespace App\Http\Controllers\Api;

use App\Events\DashboardStatsUpdated;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\UserBalance;
use App\Services\DashboardStats;
use App\Services\MedanpediaClient;
use App\Services\ServicePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class OrdersController extends Controller
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

    public function store(Request $request, MedanpediaClient $client): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'service_id' => ['required', 'integer', 'min:1'],
            'target' => ['required', 'string', 'min:1', 'max:2048'],
            'quantity' => ['required', 'integer', 'min:1'],
            'comments' => ['nullable', 'string', 'max:200000'],
        ]);

        $serviceId = (int) $validated['service_id'];
        $target = trim((string) $validated['target']);
        $quantity = (int) $validated['quantity'];
        $commentsRaw = isset($validated['comments']) ? (string) $validated['comments'] : null;

        if ($quantity <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Quantity harus lebih dari 0.',
            ], 422);
        }

        if (! $client->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Penyedia layanan belum dikonfigurasi.',
            ], 503);
        }

        $service = $this->findServiceById($client, $serviceId);

        if (! $service || ServicePolicy::isDisallowed($service)) {
            return response()->json([
                'success' => false,
                'message' => 'Service tidak ditemukan.',
            ], 404);
        }

        $min = (int) ($service['min'] ?? 1);
        $max = (int) ($service['max'] ?? 1000000);
        $serviceName = (string) ($service['name'] ?? '');

        if ($quantity < $min) {
            return response()->json([
                'success' => false,
                'message' => "Minimum quantity adalah {$min}.",
            ], 422);
        }

        if ($quantity > $max) {
            return response()->json([
                'success' => false,
                'message' => "Maximum quantity adalah {$max}.",
            ], 422);
        }

        $needsComments = $this->serviceRequiresCustomComments($service);
        $commentsNormalized = null;

        if ($needsComments) {
            if ($commentsRaw === null || trim($commentsRaw) === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Field comments wajib untuk layanan ini.',
                ], 422);
            }

            $lines = $this->normalizeCommentsLines($commentsRaw);
            if (count($lines) === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Comments tidak boleh kosong.',
                ], 422);
            }

            if (count($lines) !== $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah baris komentar harus sama dengan quantity.',
                ], 422);
            }

            $commentsNormalized = implode("\n", $lines);
        } else {
            $commentsNormalized = ($commentsRaw !== null && trim($commentsRaw) !== '') ? trim($commentsRaw) : null;
        }

        $basePrice = is_numeric($service['price'] ?? null) ? (float) $service['price'] : 0.0;
        $basePriceInt = (int) round($basePrice, 0);

        $markup = (int) config('medanpedia.markup_amount', 200);
        $pricePer1000Int = (int) round($basePriceInt + $markup, 0);

        $totalPrice = (int) round(($pricePer1000Int / 1000) * $quantity, 0);
        if ($totalPrice < 0) {
            $totalPrice = 0;
        }

        // 1) Create local order + debit balance (atomic).
        $order = null;

        try {
            $order = DB::transaction(function () use ($user, $serviceId, $serviceName, $basePriceInt, $pricePer1000Int, $totalPrice, $target, $commentsNormalized, $quantity) {
                UserBalance::query()->firstOrCreate([
                    'user_id' => $user->id,
                ], [
                    'balance' => 0,
                    'total_spent' => 0,
                    'total_deposit' => 0,
                ]);

                $balanceRow = UserBalance::query()
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                $currentBalance = $balanceRow ? (int) $balanceRow->balance : 0;

                if ($currentBalance < $totalPrice) {
                    return ['error' => 'INSUFFICIENT_BALANCE', 'available' => $currentBalance];
                }

                $created = Order::query()->create([
                    'user_id' => $user->id,
                    'service_id' => $serviceId,
                    'service_name' => $serviceName,
                    'base_price' => $basePriceInt,
                    'price_per_1000' => $pricePer1000Int,
                    'total_price' => $totalPrice,
                    'target' => $target,
                    'comments' => $commentsNormalized,
                    'quantity' => $quantity,
                    'status' => 'Submitting',
                    'status_check_attempts' => 0,
                ]);

                $balanceRow->balance = max(0, $currentBalance - $totalPrice);
                $balanceRow->total_spent = (int) $balanceRow->total_spent + $totalPrice;
                $balanceRow->save();

                return ['order' => $created, 'balance' => (int) $balanceRow->balance];
            });
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat order.',
            ], 500);
        }

        if (is_array($order) && ($order['error'] ?? null) === 'INSUFFICIENT_BALANCE') {
            $available = (int) ($order['available'] ?? 0);
            $shortfall = max(0, $totalPrice - $available);

            return response()->json([
                'success' => false,
                'code' => 'INSUFFICIENT_BALANCE',
                'message' => 'Saldo tidak cukup.',
                'required' => $totalPrice,
                'available' => $available,
                'shortfall' => $shortfall,
                'formatted' => [
                    'required' => 'Rp '.number_format($totalPrice, 0, ',', '.'),
                    'available' => 'Rp '.number_format($available, 0, ',', '.'),
                    'shortfall' => 'Rp '.number_format($shortfall, 0, ',', '.'),
                ],
            ], 200);
        }

        /** @var Order $createdOrder */
        $createdOrder = $order['order'];

        // 2) Submit to provider.
        $providerResp = $client->createOrder($serviceId, $target, $quantity, $commentsNormalized);
        $providerOk = (bool) ($providerResp['status'] ?? false);
        $providerOrderId = $this->extractProviderOrderId($providerResp);

        if (! $providerOk && $providerOrderId === null) {
            // Refund if provider submission failed.
            DB::transaction(function () use ($user, $createdOrder, $totalPrice) {
                $balanceRow = UserBalance::query()
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if ($balanceRow) {
                    $balanceRow->balance = (int) $balanceRow->balance + $totalPrice;
                    $spent = (int) $balanceRow->total_spent;
                    $balanceRow->total_spent = $spent >= $totalPrice ? $spent - $totalPrice : 0;
                    $balanceRow->save();
                }

                $createdOrder->status = 'Error';
                $createdOrder->save();
            });

            try {
                broadcast(new OrderStatusUpdated($createdOrder));
            } catch (Throwable) {
                // Best-effort only.
            }

            try {
                $stats = DashboardStats::forUser((int) $user->id);
                broadcast(new DashboardStatsUpdated((int) $user->id, $stats));
            } catch (Throwable) {
                // Best-effort only.
            }

            return response()->json([
                'success' => false,
                'message' => self::maskThirdPartyName((string) ($providerResp['msg'] ?? 'Gagal membuat order ke penyedia layanan.')),
            ], 502);
        }

        $providerStatus = data_get($providerResp, 'data.status');
        if (is_string($providerStatus) && trim($providerStatus) !== '') {
            $providerStatus = trim($providerStatus);
        } else {
            // Provider sometimes returns order_id without an explicit status.
            // Default to Pending to match provider dashboard and avoid UI flicker.
            $providerStatus = 'Pending';
        }

        $createdOrder->provider_order_id = $providerOrderId !== null ? (string) $providerOrderId : null;
        $createdOrder->status = $providerStatus;
        $createdOrder->save();

        try {
            broadcast(new OrderStatusUpdated($createdOrder));
        } catch (Throwable) {
            // Best-effort only.
        }

        $freshBalance = (int) (UserBalance::query()->where('user_id', $user->id)->value('balance') ?? 0);

        try {
            $stats = DashboardStats::forUser((int) $user->id);
            broadcast(new DashboardStatsUpdated((int) $user->id, $stats));
        } catch (Throwable) {
            // Best-effort only.
        }

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dibuat.',
            'order_id' => $createdOrder->id,
            'provider_order_id' => $createdOrder->provider_order_id,
            'total_price' => $totalPrice,
            'remaining_balance' => $freshBalance,
            'remaining_balance_formatted' => 'Rp '.number_format($freshBalance, 0, ',', '.'),
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findServiceById(MedanpediaClient $client, int $serviceId): ?array
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
                return null;
            }
        }

        $list = $this->normalizeServicesList($rawServices);

        foreach ($list as $service) {
            if (! is_array($service)) {
                continue;
            }

            $sid = $service['id'] ?? ($service['service'] ?? ($service['service_id'] ?? null));
            if ($sid !== null && is_scalar($sid) && (int) $sid === $serviceId) {
                return $service;
            }
        }

        return null;
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

        return array_values($decoded);
    }

    /**
     * @param  array<string, mixed>  $service
     */
    private function serviceRequiresCustomComments(array $service): bool
    {
        $name = isset($service['name']) ? (string) $service['name'] : '';
        $category = isset($service['category']) ? (string) $service['category'] : '';
        $desc = isset($service['description']) ? (string) $service['description'] : '';
        $type = isset($service['type']) && is_scalar($service['type']) ? (string) $service['type'] : '';

        $t = mb_strtolower(trim($type));
        if ($t !== '') {
            if ($t === 'custom_comment') {
                return true;
            }

            return preg_match('/\b(custom|costum|kustom)[_\s-]*comment(s)?\b/i', $t) === 1;
        }

        $text = trim($name.' '.$category.' '.$desc);
        if ($text === '') {
            return false;
        }

        return preg_match('/((?:custom|costum|kustom)\s*comments?|(?:custom|costum|kustom)\s*comment)/i', $text) === 1;
    }

    /**
     * @return array<int, string>
     */
    private function normalizeCommentsLines(string $raw): array
    {
        $parts = preg_split('/\r?\n/', $raw);
        if (! is_array($parts)) {
            return [];
        }

        $lines = [];
        foreach ($parts as $p) {
            $t = trim((string) $p);
            if ($t !== '') {
                $lines[] = $t;
            }
        }

        return $lines;
    }

    /**
     * @param  array<string, mixed>  $providerResp
     */
    private function extractProviderOrderId(array $providerResp): string|int|null
    {
        $candidates = [
            data_get($providerResp, 'data.id'),
            data_get($providerResp, 'order'),
            data_get($providerResp, 'data.order'),
            data_get($providerResp, 'order_id'),
            data_get($providerResp, 'id'),
            data_get($providerResp, 'data.order_id'),
        ];

        foreach ($candidates as $value) {
            if ($value === null) {
                continue;
            }
            if (is_scalar($value) && trim((string) $value) !== '') {
                return is_numeric($value) ? (int) $value : (string) $value;
            }
        }

        return null;
    }
}
