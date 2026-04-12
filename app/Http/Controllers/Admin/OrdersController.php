<?php

namespace App\Http\Controllers\Admin;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\AdminActivity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class OrdersController extends Controller
{
    private const CANONICAL_STATUSES = [
        'pending' => 'Pending',
        'processing' => 'Processing',
        'success' => 'Success',
        'partial' => 'Partial',
        'canceled' => 'Canceled',
        'failed' => 'Failed',
        'error' => 'Error',
        'submitting' => 'Submitting',
    ];

    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $id = trim((string) $request->query('id', ''));
        $idInt = null;
        if ($id !== '' && ctype_digit($id)) {
            $idInt = (int) $id;
        } else {
            $id = '';
        }

        $userId = trim((string) $request->query('user_id', ''));
        $userIdInt = null;
        if ($userId !== '' && ctype_digit($userId)) {
            $userIdInt = (int) $userId;
        } else {
            $userId = '';
        }
        $status = trim((string) $request->query('status', ''));
        $target = trim((string) $request->query('target', ''));
        $dateFrom = trim((string) $request->query('date_from', now()->toDateString()));
        $dateTo = trim((string) $request->query('date_to', now()->toDateString()));

        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $rangeStart = Carbon::parse($dateFrom)->startOfDay();
        $rangeEnd = Carbon::parse($dateTo)->endOfDay();

        $query = Order::query()->with(['user:id,name,email']);

        if ($idInt !== null) {
            $query->where('id', $idInt);
        }

        if ($userIdInt !== null) {
            $query->where('user_id', $userIdInt);
        }

        if ($idInt === null && $userIdInt === null) {
            $query->whereBetween('created_at', [$rangeStart, $rangeEnd]);
        }

        if ($q !== '') {
            $qLower = mb_strtolower($q);
            $query->where(function (Builder $sub) use ($q, $qLower) {
                $sub->where('service_name', 'like', "%{$q}%")
                    ->orWhereHas('user', function (Builder $uq) use ($q) {
                        $uq->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%");
                    });

                if ($qLower !== $q) {
                    $sub->orWhere('service_name', 'like', "%{$qLower}%");
                }
            });
        }

        if ($target !== '') {
            $query->where('target', 'like', "%{$target}%");
        }

        $statusKey = strtolower($status);
        if ($statusKey !== '' && array_key_exists($statusKey, self::CANONICAL_STATUSES)) {
            $query->whereRaw('LOWER(status) = ?', [$statusKey]);
        } else {
            $status = '';
        }

        $statsQuery = (clone $query)->select(['id', 'status']);

        $paginator = $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $rows = $paginator->getCollection()->map(function (Order $order) {
            return [
                'id' => (int) $order->id,
                'created_at' => $order->created_at?->toISOString(),
                'created_at_wib' => $order->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'service_name' => (string) ($order->service_name ?? ''),
                'target' => (string) ($order->target ?? ''),
                'quantity' => (int) ($order->quantity ?? 0),
                'total_price' => (int) ($order->total_price ?? 0),
                'status' => (string) ($order->status ?? ''),
                'provider_order_id' => $order->provider_order_id !== null ? (string) $order->provider_order_id : null,
                'user' => [
                    'id' => (int) ($order->user?->id ?? 0),
                    'name' => $order->user?->name,
                    'email' => $order->user?->email,
                ],
            ];
        })->all();

        $paginator->setCollection(collect($rows));

        $stats = [
            'total' => 0,
            'success' => 0,
            'processing' => 0,
            'failed' => 0,
        ];

        try {
            $stats = $this->computeStats($statsQuery);
        } catch (Throwable) {
            // best-effort
        }

        return Inertia::render('admin/orders', [
            'orders' => $paginator,
            'stats' => $stats,
            'filters' => [
                'q' => $q,
                'id' => $id,
                'user_id' => $userId,
                'status' => $status,
                'target' => $target,
                'date_from' => $rangeStart->toDateString(),
                'date_to' => $rangeEnd->toDateString(),
                'per_page' => $perPage,
            ],
            'known_statuses' => array_keys(self::CANONICAL_STATUSES),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $order->loadMissing(['user:id,name,email']);

        return Inertia::render('admin/order-detail', [
            'order' => [
                'id' => (int) $order->id,
                'created_at' => $order->created_at?->toISOString(),
                'created_at_wib' => $order->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'updated_at' => $order->updated_at?->toISOString(),
                'updated_at_wib' => $order->updated_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'service_id' => (int) ($order->service_id ?? 0),
                'service_name' => (string) ($order->service_name ?? ''),
                'target' => (string) ($order->target ?? ''),
                'comments' => $order->comments !== null ? (string) $order->comments : null,
                'quantity' => (int) ($order->quantity ?? 0),
                'base_price' => (int) ($order->base_price ?? 0),
                'price_per_1000' => (int) ($order->price_per_1000 ?? 0),
                'total_price' => (int) ($order->total_price ?? 0),
                'status' => (string) ($order->status ?? ''),
                'provider_order_id' => $order->provider_order_id !== null ? (string) $order->provider_order_id : null,
                'start_count' => $order->start_count !== null ? (int) $order->start_count : null,
                'remains' => $order->remains !== null ? (int) $order->remains : null,
                'charge' => $order->charge !== null ? (int) $order->charge : null,
                'last_status_check' => $order->last_status_check?->toISOString(),
                'last_status_check_wib' => $order->last_status_check?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'status_check_attempts' => (int) ($order->status_check_attempts ?? 0),
                'user' => [
                    'id' => (int) ($order->user?->id ?? 0),
                    'name' => $order->user?->name,
                    'email' => $order->user?->email,
                ],
            ],
            'known_statuses' => self::CANONICAL_STATUSES,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'min:2', 'max:32'],
        ]);

        $statusKey = strtolower(trim((string) $validated['status']));
        if (! array_key_exists($statusKey, self::CANONICAL_STATUSES)) {
            return back()->with('error', 'Status tidak valid.');
        }

        $before = (string) ($order->status ?? '');
        $order->status = self::CANONICAL_STATUSES[$statusKey];
        $order->save();

        try {
            broadcast(new OrderStatusUpdated($order));
        } catch (Throwable) {
            // best-effort
        }

        AdminActivity::log(
            $request,
            'order_status_update',
            'order',
            (string) $order->id,
            'Perbarui status pesanan: '.($before !== '' ? $before : '-').' → '.$order->status,
            [
                'from' => $before,
                'to' => (string) $order->status,
                'order_id' => (int) $order->id,
                'user_id' => (int) $order->user_id,
            ]
        );

        return back()->with('success', 'Status pesanan diperbarui.');
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<\App\Models\Order>  $query
     * @return array{total:int, success:int, processing:int, failed:int}
     */
    private function computeStats($query): array
    {
        $total = (int) (clone $query)->count();

        $success = (int) (clone $query)
            ->whereRaw('LOWER(status) = ?', ['success'])
            ->count();

        $processing = (int) (clone $query)
            ->whereRaw('LOWER(status) IN (?,?,?,?)', ['pending', 'processing', 'submitting', 'partial'])
            ->count();

        $failed = (int) (clone $query)
            ->whereRaw('LOWER(status) IN (?,?,?)', ['failed', 'error', 'canceled'])
            ->count();

        return [
            'total' => $total,
            'success' => $success,
            'processing' => $processing,
            'failed' => $failed,
        ];
    }
}
