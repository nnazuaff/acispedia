<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Order;
use App\Models\UserBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FinancialReportController extends Controller
{
    public function index(Request $request): Response
    {
        $dateFrom = trim((string) $request->query('date_from', now()->startOfMonth()->toDateString()));
        $dateTo = trim((string) $request->query('date_to', now()->toDateString()));

        try {
            $rangeStart = Carbon::parse($dateFrom)->startOfDay();
        } catch (Throwable) {
            $rangeStart = now()->startOfMonth()->startOfDay();
        }

        try {
            $rangeEnd = Carbon::parse($dateTo)->endOfDay();
        } catch (Throwable) {
            $rangeEnd = now()->endOfDay();
        }

        $deposits = Deposit::query()->whereBetween('created_at', [$rangeStart, $rangeEnd]);
        $orders = Order::query()->whereBetween('created_at', [$rangeStart, $rangeEnd]);

        $stats = [
            'deposit_success_count' => (int) (clone $deposits)->where('status', 'success')->count(),
            'deposit_success_amount' => (int) (clone $deposits)->where('status', 'success')->sum('amount'),
            'deposit_pending_count' => (int) (clone $deposits)->where('status', 'pending')->count(),
            'order_total_count' => (int) (clone $orders)->count(),
            'order_success_count' => (int) (clone $orders)->whereRaw('LOWER(status) = ?', ['success'])->count(),
            'order_failed_count' => (int) (clone $orders)->whereRaw('LOWER(status) = ?', ['failed'])->count(),
            'order_total_spent' => (int) (clone $orders)->sum('total_price'),
            'total_user_balance' => (int) UserBalance::query()->sum('balance'),
        ];

        return Inertia::render('admin/financial-report', [
            'stats' => $stats,
            'filters' => [
                'date_from' => $rangeStart->toDateString(),
                'date_to' => $rangeEnd->toDateString(),
            ],
        ]);
    }
}
