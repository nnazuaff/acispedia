<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\Order;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class FinancialReportMetrics
{
    /**
     * @return array{total_deposit:int,total_sales:int,net_profit:int}
     */
    public static function summarize(Carbon $rangeStartUtc, Carbon $rangeEndUtc): array
    {
        $totalDeposit = (int) Deposit::query()
            ->whereBetween('created_at', [$rangeStartUtc, $rangeEndUtc])
            ->sum('amount');

        $revenueCost = Order::query()
            ->whereBetween('created_at', [$rangeStartUtc, $rangeEndUtc])
            ->select([
                DB::raw('COALESCE(SUM(total_price), 0) as revenue'),
                DB::raw('COALESCE(SUM(ROUND((COALESCE(base_price, 0) * COALESCE(quantity, 0)) / 1000)), 0) as cost'),
            ])
            ->first();

        $totalSales = (int) data_get($revenueCost, 'revenue', 0);
        $netProfit = (int) ($totalSales - (int) data_get($revenueCost, 'cost', 0));

        return [
            'total_deposit' => $totalDeposit,
            'total_sales' => $totalSales,
            'net_profit' => $netProfit,
        ];
    }
}
