<?php

namespace App\Http\Controllers\Admin;

use App\Events\DashboardStatsUpdated;
use App\Events\DepositStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\UserBalance;
use App\Services\DashboardStats;
use App\Support\AdminActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DepositsController extends Controller
{
    private const KNOWN_STATUSES = ['pending', 'success', 'failed', 'expired', 'canceled'];

    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $method = trim((string) $request->query('method', ''));
        $dateFrom = trim((string) $request->query('date_from', now()->toDateString()));
        $dateTo = trim((string) $request->query('date_to', now()->toDateString()));

        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) {
            $perPage = 20;
        }
        if ($perPage > 200) {
            $perPage = 200;
        }

        try {
            $rangeStart = Carbon::parse($dateFrom)->startOfDay();
        } catch (Throwable) {
            $rangeStart = now()->startOfDay();
        }

        try {
            $rangeEnd = Carbon::parse($dateTo)->endOfDay();
        } catch (Throwable) {
            $rangeEnd = now()->endOfDay();
        }

        $query = Deposit::query()->with(['user:id,name,email']);

        $query->whereBetween('created_at', [$rangeStart, $rangeEnd]);

        if ($q !== '') {
            $query->whereHas('user', function ($uq) use ($q) {
                $uq->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $statusKey = strtolower($status);
        if ($statusKey !== '' && in_array($statusKey, self::KNOWN_STATUSES, true)) {
            $query->where('status', $statusKey);
        } else {
            $status = '';
        }

        $methodKey = strtolower($method);
        if ($methodKey !== '') {
            if ($methodKey === 'qris') {
                $query->whereNotNull('tripay_method')->where('tripay_method', 'like', '%QRIS%');
            } elseif ($methodKey === 'ewallet') {
                $query->whereNotNull('tripay_method')->whereIn(DB::raw('UPPER(tripay_method)'), ['OVO', 'DANA', 'SHOPEEPAY']);
            } elseif ($methodKey === 'tripay') {
                $query->where('payment_method', 'tripay');
            } else {
                $method = '';
            }
        }

        $statsQuery = (clone $query)->select(['id', 'status']);

        $paginator = $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $rows = $paginator->getCollection()->map(function (Deposit $deposit) {
            return [
                'id' => (int) $deposit->id,
                'amount' => (int) ($deposit->amount ?? 0),
                'final_amount' => (int) ($deposit->final_amount ?? 0),
                'status' => (string) ($deposit->status ?? ''),
                'payment_method' => (string) ($deposit->payment_method ?? ''),
                'tripay_method' => $deposit->tripay_method !== null ? (string) $deposit->tripay_method : null,
                'tripay_merchant_ref' => $deposit->tripay_merchant_ref !== null ? (string) $deposit->tripay_merchant_ref : null,
                'tripay_reference' => $deposit->tripay_reference !== null ? (string) $deposit->tripay_reference : null,
                'tripay_pay_code' => $deposit->tripay_pay_code !== null ? (string) $deposit->tripay_pay_code : null,
                'tripay_checkout_url' => $deposit->tripay_checkout_url !== null ? (string) $deposit->tripay_checkout_url : null,
                'tripay_status' => $deposit->tripay_status !== null ? (string) $deposit->tripay_status : null,
                'created_at' => $deposit->created_at?->toISOString(),
                'created_at_wib' => $deposit->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'expired_at' => $deposit->expired_at?->toISOString(),
                'expired_at_wib' => $deposit->expired_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'processed_at' => $deposit->processed_at?->toISOString(),
                'processed_at_wib' => $deposit->processed_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'user' => [
                    'id' => (int) ($deposit->user?->id ?? 0),
                    'name' => $deposit->user?->name,
                    'email' => $deposit->user?->email,
                ],
            ];
        })->all();

        $paginator->setCollection(collect($rows));

        $stats = $this->computeStats($statsQuery);

        return Inertia::render('admin/deposits', [
            'deposits' => $paginator,
            'stats' => $stats,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'method' => $method,
                'date_from' => $rangeStart->toDateString(),
                'date_to' => $rangeEnd->toDateString(),
                'per_page' => $perPage,
            ],
            'known_statuses' => self::KNOWN_STATUSES,
        ]);
    }

    public function show(Request $request, Deposit $deposit): Response
    {
        $deposit->loadMissing(['user:id,name,email']);

        return Inertia::render('admin/deposit-detail', [
            'deposit' => [
                'id' => (int) $deposit->id,
                'amount' => (int) ($deposit->amount ?? 0),
                'final_amount' => (int) ($deposit->final_amount ?? 0),
                'status' => (string) ($deposit->status ?? ''),
                'payment_method' => (string) ($deposit->payment_method ?? ''),
                'tripay_merchant_ref' => $deposit->tripay_merchant_ref,
                'tripay_reference' => $deposit->tripay_reference,
                'tripay_method' => $deposit->tripay_method,
                'tripay_pay_code' => $deposit->tripay_pay_code,
                'tripay_checkout_url' => $deposit->tripay_checkout_url,
                'tripay_status' => $deposit->tripay_status,
                'expired_at_wib' => $deposit->expired_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'processed_at_wib' => $deposit->processed_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'created_at_wib' => $deposit->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'updated_at_wib' => $deposit->updated_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'user' => [
                    'id' => (int) ($deposit->user?->id ?? 0),
                    'name' => $deposit->user?->name,
                    'email' => $deposit->user?->email,
                ],
                'provider_payload' => $deposit->provider_payload,
            ],
            'known_statuses' => self::KNOWN_STATUSES,
        ]);
    }

    public function updateStatus(Request $request, Deposit $deposit): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'min:2', 'max:32'],
        ]);

        $next = strtolower(trim((string) $validated['status']));
        if (! in_array($next, self::KNOWN_STATUSES, true)) {
            return back()->with('error', 'Status tidak valid.');
        }

        $before = null;
        $after = null;
        $didCredit = false;
        $userId = null;

        try {
            DB::transaction(function () use ($deposit, $next, &$before, &$after, &$didCredit, &$userId) {
                $row = Deposit::query()->lockForUpdate()->find((int) $deposit->id);
                if (! $row) {
                    return;
                }

                $userId = (int) $row->user_id;
                $before = (string) ($row->status ?? '');

                if ($before === 'success' && $next !== 'success') {
                    $after = $before;
                    return;
                }

                if ($next === $before) {
                    $after = $before;
                    return;
                }

                if ($next === 'success') {
                    if ($before !== 'pending') {
                        $after = $before;
                        return;
                    }

                    $row->status = 'success';
                    $row->processed_at = now();
                    $row->save();

                    UserBalance::query()->firstOrCreate([
                        'user_id' => (int) $row->user_id,
                    ], [
                        'balance' => 0,
                        'total_spent' => 0,
                        'total_deposit' => 0,
                    ]);

                    $bal = UserBalance::query()
                        ->where('user_id', (int) $row->user_id)
                        ->lockForUpdate()
                        ->first();

                    if ($bal) {
                        $bal->balance = (int) $bal->balance + (int) $row->amount;
                        $bal->total_deposit = (int) $bal->total_deposit + (int) $row->amount;
                        $bal->save();
                        $didCredit = true;
                    }

                    $after = 'success';

                    return;
                }

                // Non-success updates are only safe while pending.
                if ($before !== 'pending') {
                    $after = $before;
                    return;
                }

                $row->status = $next;
                $row->processed_at = now();
                $row->save();

                $after = $next;
            });
        } catch (Throwable $e) {
            report($e);
            return back()->with('error', 'Gagal memperbarui status deposit.');
        }

        if ($before === null || $after === null) {
            return back()->with('error', 'Deposit tidak ditemukan.');
        }

        if ($before === 'success' && $after === 'success' && $next !== 'success') {
            return back()->with('error', 'Deposit sukses tidak bisa diturunkan statusnya.');
        }

        try {
            $fresh = Deposit::query()->find((int) $deposit->id);
            if ($fresh) {
                broadcast(new DepositStatusUpdated($fresh));
            }
        } catch (Throwable) {
            // best-effort
        }

        if ($didCredit && is_int($userId)) {
            try {
                $stats = DashboardStats::forUser((int) $userId);
                broadcast(new DashboardStatsUpdated((int) $userId, $stats));
            } catch (Throwable) {
                // best-effort
            }
        }

        AdminActivity::log(
            $request,
            'deposit_status_update',
            'deposit',
            (string) $deposit->id,
            'Perbarui status deposit: '.($before !== '' ? $before : '-').' → '.$after,
            [
                'from' => $before,
                'to' => $after,
                'deposit_id' => (int) $deposit->id,
                'user_id' => $userId,
                'credited' => $didCredit,
            ]
        );

        if ($before === $after) {
            return back()->with('info', 'Status deposit tidak berubah.');
        }

        return back()->with('success', 'Status deposit diperbarui.');
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<\App\Models\Deposit>  $query
     * @return array{total:int, success:int, pending:int, expired:int, failed:int, canceled:int}
     */
    private function computeStats($query): array
    {
        $total = (int) (clone $query)->count();

        $success = (int) (clone $query)->where('status', 'success')->count();
        $pending = (int) (clone $query)->where('status', 'pending')->count();
        $expired = (int) (clone $query)->where('status', 'expired')->count();
        $failed = (int) (clone $query)->where('status', 'failed')->count();
        $canceled = (int) (clone $query)->where('status', 'canceled')->count();

        return [
            'total' => $total,
            'success' => $success,
            'pending' => $pending,
            'expired' => $expired,
            'failed' => $failed,
            'canceled' => $canceled,
        ];
    }
}
