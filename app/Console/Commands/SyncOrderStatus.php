<?php

namespace App\Console\Commands;

use App\Events\DashboardStatsUpdated;
use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Services\DashboardStats;
use App\Services\MedanpediaClient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncOrderStatus extends Command
{
    protected $signature = 'orders:sync-status {--limit=20 : Max orders to check}';

    protected $description = 'Sync non-final order statuses from Medanpedia';

    public function handle(MedanpediaClient $client): int
    {
        if (! $client->isConfigured()) {
            $this->warn('Medanpedia is not configured.');

            return self::SUCCESS;
        }

        $limit = (int) $this->option('limit');
        if ($limit < 1) {
            $limit = 20;
        }
        if ($limit > 100) {
            $limit = 100;
        }

        $finalStatuses = ['Success', 'Canceled', 'Partial', 'Error'];

        $orders = Order::query()
            ->whereNotNull('provider_order_id')
            ->whereNotIn('status', $finalStatuses)
            ->where(function ($q) {
                $q->whereNull('last_status_check')
                    ->orWhere('last_status_check', '<', now()->subMinutes(5));
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'user_id', 'provider_order_id', 'status']);

        if ($orders->isEmpty()) {
            $this->line('No eligible orders to sync.');

            return self::SUCCESS;
        }

        $providerIds = $orders->pluck('provider_order_id')->filter()->values()->all();
        $resp = $client->getOrdersStatusBulk($providerIds);

        $now = now();
        $updated = 0;
        $checked = 0;

        foreach ($orders as $order) {
            $checked++;
            $providerId = (string) $order->provider_order_id;

            $info = null;
            if (isset($resp['orders']) && is_array($resp['orders']) && isset($resp['orders'][$providerId]) && is_array($resp['orders'][$providerId])) {
                $info = $resp['orders'][$providerId];
            } elseif (isset($resp['normalized_orders']) && is_array($resp['normalized_orders']) && isset($resp['normalized_orders'][$providerId]) && is_array($resp['normalized_orders'][$providerId])) {
                $info = $resp['normalized_orders'][$providerId];
            } elseif (isset($resp['data']) && is_array($resp['data']) && isset($resp['data']['id']) && (string) $resp['data']['id'] === $providerId) {
                $info = $resp['data'];
            }

            $nextStatus = is_array($info) ? ($info['status'] ?? null) : null;
            $nextStatus = is_string($nextStatus) ? trim($nextStatus) : null;

            DB::transaction(function () use ($order, $info, $nextStatus, $now, &$updated) {
                $fresh = Order::query()->lockForUpdate()->find($order->id);
                if (! $fresh) {
                    return;
                }

                $statusChanged = false;

                $fresh->last_status_check = $now;
                $fresh->status_check_attempts = (int) $fresh->status_check_attempts + 1;

                if ($nextStatus !== null && $nextStatus !== '' && $nextStatus !== $fresh->status) {
                    $fresh->status = $nextStatus;
                    $statusChanged = true;
                    $updated++;
                }

                if (is_array($info)) {
                    if (isset($info['start_count']) && is_numeric($info['start_count'])) {
                        $fresh->start_count = (int) $info['start_count'];
                    }
                    if (isset($info['remains']) && is_numeric($info['remains'])) {
                        $fresh->remains = (int) $info['remains'];
                    }
                    if (isset($info['charge']) && is_numeric($info['charge'])) {
                        $fresh->charge = (int) round((float) $info['charge'], 0);
                    }
                }

                $fresh->save();

                if ($statusChanged) {
                    $orderId = $fresh->id;
                    $userId = (int) $fresh->user_id;

                    DB::afterCommit(function () use ($orderId, $userId) {
                        $order = Order::query()->find($orderId);
                        if (! $order) {
                            return;
                        }

                        broadcast(new OrderStatusUpdated($order));

                        try {
                            $stats = DashboardStats::forUser($userId);
                            broadcast(new DashboardStatsUpdated($userId, $stats));
                        } catch (\Throwable) {
                            // Best-effort only.
                        }
                    });
                }
            });
        }

        $this->info("Checked {$checked} order(s). Updated status for {$updated} order(s).");

        return self::SUCCESS;
    }
}
