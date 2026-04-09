<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Order;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    private function fmtWib(?CarbonInterface $dt): ?string
    {
        if (! $dt) {
            return null;
        }

        try {
            return $dt->copy()->timezone('Asia/Jakarta')->format('d/m/Y H:i').' WIB';
        } catch (\Throwable) {
            return $dt->toISOString();
        }
    }

    public function transactionShow(Request $request, Order $order): Response
    {
        $user = $request->user();

        if (! $user || (int) $order->user_id !== (int) $user->id) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        return Inertia::render('history/transaction-show', [
            'order' => [
                'id' => (int) $order->id,
                'service_id' => (int) $order->service_id,
                'service_name' => (string) $order->service_name,
                'target' => (string) $order->target,
                'quantity' => (int) $order->quantity,
                'total_price' => (int) $order->total_price,
                'status' => (string) $order->status,
                'provider_order_id' => $order->provider_order_id ? (string) $order->provider_order_id : null,
                'start_count' => $order->start_count !== null ? (int) $order->start_count : null,
                'remains' => $order->remains !== null ? (int) $order->remains : null,
                'charge' => $order->charge !== null ? (int) $order->charge : null,
                'created_at' => $order->created_at?->toISOString(),
                'last_status_check' => $order->last_status_check?->toISOString(),
                'status_check_attempts' => (int) ($order->status_check_attempts ?? 0),
            ],
        ]);
    }

    public function depositShow(Request $request, Deposit $deposit): Response
    {
        $user = $request->user();

        if (! $user || (int) $deposit->user_id !== (int) $user->id) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        return Inertia::render('history/deposit-show', [
            'deposit' => [
                'id' => (int) $deposit->id,
                'amount' => (int) $deposit->amount,
                'final_amount' => (int) $deposit->final_amount,
                'status' => (string) $deposit->status,
                'payment_method' => (string) $deposit->payment_method,
                'tripay_method' => $deposit->tripay_method ? (string) $deposit->tripay_method : null,
                'tripay_merchant_ref' => $deposit->tripay_merchant_ref ? (string) $deposit->tripay_merchant_ref : null,
                'tripay_reference' => $deposit->tripay_reference ? (string) $deposit->tripay_reference : null,
                'tripay_pay_code' => $deposit->tripay_pay_code ? (string) $deposit->tripay_pay_code : null,
                'tripay_checkout_url' => $deposit->tripay_checkout_url ? (string) $deposit->tripay_checkout_url : null,
                'tripay_status' => $deposit->tripay_status ? (string) $deposit->tripay_status : null,
                'created_at' => $deposit->created_at?->toISOString(),
                'expired_at' => $deposit->expired_at?->toISOString(),
                'processed_at' => $deposit->processed_at?->toISOString(),
            ],
        ]);
    }

    public function transaction(Request $request): Response
    {
        $user = $request->user();

        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $perPage = (int) $request->query('per_page', 25);

        if ($perPage < 5) {
            $perPage = 5;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $ordersQuery = Order::query()
            ->where('user_id', (int) $user->id);

        if ($q !== '') {
            $ordersQuery->where(function ($query) use ($q) {
                $query
                    ->where('service_name', 'like', '%'.$q.'%')
                    ->orWhere('target', 'like', '%'.$q.'%')
                    ->orWhere('provider_order_id', 'like', '%'.$q.'%');
            });
        }

        if ($status !== '' && $status !== 'all') {
            $ordersQuery->where('status', $status);
        }

        $orders = $ordersQuery
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Order $order) {
                return [
                    'id' => (int) $order->id,
                    'service_name' => (string) $order->service_name,
                    'target' => (string) $order->target,
                    'quantity' => (int) $order->quantity,
                    'total_price' => (int) $order->total_price,
                    'status' => (string) $order->status,
                    'provider_order_id' => $order->provider_order_id ? (string) $order->provider_order_id : null,
                    'created_at' => $order->created_at?->toISOString(),
                    'created_at_wib' => $this->fmtWib($order->created_at),
                ];
            });

        return Inertia::render('history/transaction', [
            'orders' => $orders,
            'filters' => [
                'q' => $q,
                'status' => $status !== '' ? $status : 'all',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function deposit(Request $request): Response
    {
        $user = $request->user();

        // Best-effort: expire old pending deposits when user opens history.
        DB::transaction(function () use ($user) {
            Deposit::query()
                ->where('user_id', (int) $user->id)
                ->where('status', 'pending')
                ->whereNotNull('expired_at')
                ->where('expired_at', '<', now())
                ->update([
                    'status' => 'expired',
                    'processed_at' => now(),
                ]);
        });

        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $method = trim((string) $request->query('method', ''));
        if ($method === 'tripay') {
            $method = 'qris';
        }
        $ewalletCode = trim((string) $request->query('ewallet_code', ''));
        $year = (int) $request->query('year', (int) now()->format('Y'));
        $perPage = (int) $request->query('per_page', 25);

        if ($perPage < 5) {
            $perPage = 5;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $query = Deposit::query()
            ->where('user_id', (int) $user->id)
            ->orderByDesc('created_at');

        if ($year > 0) {
            $query->whereYear('created_at', $year);
        }

        // Notes:
        // - DB payment_method stays 'tripay' for both QRIS and E-Wallet.
        // - We split them by tripay_method (OVO/DANA/SHOPEEPAY = E-Wallet; others = QRIS).
        if ($method !== '' && $method !== 'all') {
            if ($method === 'ewallet') {
                $query->where('payment_method', 'tripay');
                $query->whereIn(DB::raw("UPPER(COALESCE(tripay_method, ''))"), ['OVO', 'DANA', 'SHOPEEPAY']);

                if ($ewalletCode !== '' && $ewalletCode !== 'all') {
                    $query->where(DB::raw("UPPER(COALESCE(tripay_method, ''))"), strtoupper($ewalletCode));
                }
            } elseif ($method === 'qris') {
                $query->where('payment_method', 'tripay');
                $query->whereNotIn(DB::raw("UPPER(COALESCE(tripay_method, ''))"), ['OVO', 'DANA', 'SHOPEEPAY']);
            } else {
                $query->where('payment_method', $method);
            }
        }

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub
                    ->where('tripay_merchant_ref', 'like', '%'.$q.'%')
                    ->orWhere('tripay_reference', 'like', '%'.$q.'%')
                    ->orWhere('tripay_pay_code', 'like', '%'.$q.'%')
                    ->orWhere('tripay_method', 'like', '%'.$q.'%');
            });
        }

        $deposits = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Deposit $deposit) {
                return [
                    'id' => (int) $deposit->id,
                    'amount' => (int) $deposit->amount,
                    'final_amount' => (int) $deposit->final_amount,
                    'status' => (string) $deposit->status,
                    'payment_method' => (string) $deposit->payment_method,
                    'tripay_method' => $deposit->tripay_method ? (string) $deposit->tripay_method : null,
                    'tripay_merchant_ref' => $deposit->tripay_merchant_ref ? (string) $deposit->tripay_merchant_ref : null,
                    'tripay_reference' => $deposit->tripay_reference ? (string) $deposit->tripay_reference : null,
                    'tripay_pay_code' => $deposit->tripay_pay_code ? (string) $deposit->tripay_pay_code : null,
                    'tripay_checkout_url' => $deposit->tripay_checkout_url ? (string) $deposit->tripay_checkout_url : null,
                    'tripay_status' => $deposit->tripay_status ? (string) $deposit->tripay_status : null,
                    'created_at' => $deposit->created_at?->toISOString(),
                    'created_at_wib' => $this->fmtWib($deposit->created_at),
                    'expired_at' => $deposit->expired_at?->toISOString(),
                    'expired_at_wib' => $this->fmtWib($deposit->expired_at),
                    'processed_at' => $deposit->processed_at?->toISOString(),
                    'processed_at_wib' => $this->fmtWib($deposit->processed_at),
                ];
            });

        return Inertia::render('history/deposit', [
            'deposits' => $deposits,
            'filters' => [
                'q' => $q,
                'status' => $status !== '' ? $status : 'all',
                'method' => $method !== '' ? $method : 'all',
                'ewallet_code' => $ewalletCode !== '' ? $ewalletCode : 'all',
                'year' => $year,
                'per_page' => $perPage,
            ],
        ]);
    }
}
