<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Order;
use App\Services\MidtransClient;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
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
                'payment_url' => $deposit->paymentUrl(),
                'snap_token' => $deposit->snapToken(),
                'payment_channel' => $deposit->paymentChannel(),
                'provider_reference' => $deposit->providerReference(),
                'provider_transaction_id' => $deposit->providerTransactionId(),
                'provider_status' => $deposit->providerStatus(),
                'created_at' => $deposit->created_at?->toISOString(),
                'expired_at' => $deposit->expired_at?->toISOString(),
                'processed_at' => $deposit->processed_at?->toISOString(),
            ],
            'midtrans_client_key' => (string) config('midtrans.client_key', ''),
            'midtrans_snap_js_url' => MidtransClient::snapJsUrl(),
            'midtrans_finish_url' => trim((string) config('midtrans.finish_url', '')),
        ]);
    }

    public function transaction(Request $request): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        if ($perPage < 5) {
            $perPage = 5;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $ordersQuery = Order::query()
            ->where('user_id', (int) $user->id);

        if ($q !== '') {
            $ordersQuery->where(function (Builder $query) use ($q) {
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

        if (! $user) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

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
        } elseif ($method === 'midtrans') {
            $method = 'isi_saldo';
        }
        $ewalletCode = trim((string) $request->query('ewallet_code', ''));
        $year = (int) $request->query('year', (int) now()->format('Y'));
        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

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
                $query->where(function (Builder $filter) {
                    $filter->where(function (Builder $tripay) {
                        $tripay->where('payment_method', 'tripay')
                            ->whereIn(DB::raw("UPPER(COALESCE(tripay_method, ''))"), ['OVO', 'DANA', 'SHOPEEPAY']);
                    })->orWhere(function (Builder $midtrans) {
                        $midtrans->where('payment_method', 'midtrans')
                            ->whereIn(DB::raw("LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(provider_payload, '$.payment_type')), ''))"), ['gopay', 'shopeepay']);
                    });
                });

                if ($ewalletCode !== '' && $ewalletCode !== 'all') {
                    $upperCode = strtoupper($ewalletCode);
                    $lowerCode = strtolower($ewalletCode);
                    $query->where(function (Builder $wallet) use ($upperCode, $lowerCode) {
                        $wallet->where(DB::raw("UPPER(COALESCE(tripay_method, ''))"), $upperCode)
                            ->orWhere(DB::raw("LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(provider_payload, '$.payment_type')), ''))"), $lowerCode);
                    });
                }
            } elseif ($method === 'qris') {
                $query->where(function (Builder $filter) {
                    $filter->where(function (Builder $tripay) {
                        $tripay->where('payment_method', 'tripay')
                            ->whereNotIn(DB::raw("UPPER(COALESCE(tripay_method, ''))"), ['OVO', 'DANA', 'SHOPEEPAY']);
                    })->orWhere(function (Builder $midtrans) {
                        $midtrans->where('payment_method', 'midtrans')
                            ->where(function (Builder $channel) {
                                $channel->where(DB::raw("LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(provider_payload, '$.payment_type')), ''))"), 'qris')
                                    ->orWhere(DB::raw("LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(provider_payload, '$.requested_channel')), ''))"), 'qris');
                            });
                    });
                });
            } elseif ($method === 'va_bank') {
                $query->where('payment_method', 'midtrans')
                    ->where(DB::raw("LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(provider_payload, '$.payment_type')), ''))"), 'bank_transfer');
            } elseif ($method === 'isi_saldo') {
                $query->where('payment_method', 'midtrans');
            } else {
                $query->where('payment_method', $method);
            }
        }

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $query->where(function (Builder $sub) use ($q) {
                $sub
                    ->where('tripay_merchant_ref', 'like', '%'.$q.'%')
                    ->orWhere('tripay_reference', 'like', '%'.$q.'%')
                    ->orWhere('tripay_pay_code', 'like', '%'.$q.'%')
                    ->orWhere('tripay_method', 'like', '%'.$q.'%')
                    ->orWhere('provider_payload', 'like', '%'.$q.'%');
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
                    'payment_url' => $deposit->paymentUrl(),
                    'snap_token' => $deposit->snapToken(),
                    'payment_channel' => $deposit->paymentChannel(),
                    'provider_reference' => $deposit->providerReference(),
                    'provider_transaction_id' => $deposit->providerTransactionId(),
                    'provider_status' => $deposit->providerStatus(),
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
            'midtrans_client_key' => (string) config('midtrans.client_key', ''),
            'midtrans_snap_js_url' => MidtransClient::snapJsUrl(),
            'midtrans_finish_url' => trim((string) config('midtrans.finish_url', '')),
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
