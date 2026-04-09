<?php

namespace App\Services;

use App\Models\Order;
use App\Models\UserBalance;

final class DashboardStats
{
    /**
     * @return array{balance:int,totalMonth:int,active:int,completed:int,totalSpent:int}
     */
    public static function empty(): array
    {
        return [
            'balance' => 0,
            'totalMonth' => 0,
            'active' => 0,
            'completed' => 0,
            'totalSpent' => 0,
        ];
    }

    /**
     * @return array{balance:int,totalMonth:int,active:int,completed:int,totalSpent:int}
     */
    public static function forUser(int $userId): array
    {
        if ($userId <= 0) {
            return self::empty();
        }

        $balanceRow = UserBalance::query()
            ->where('user_id', $userId)
            ->first(['balance', 'total_spent']);

        $balance = (int) ($balanceRow?->balance ?? 0);
        $totalSpent = (int) ($balanceRow?->total_spent ?? 0);

        $startOfMonth = now()->startOfMonth();

        $totalMonth = (int) Order::query()
            ->where('user_id', $userId)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $finalStatuses = ['Success', 'Canceled', 'Partial', 'Error'];

        $active = (int) Order::query()
            ->where('user_id', $userId)
            ->whereNotIn('status', $finalStatuses)
            ->count();

        $completed = (int) Order::query()
            ->where('user_id', $userId)
            ->where('status', 'Success')
            ->count();

        return [
            'balance' => $balance,
            'totalMonth' => $totalMonth,
            'active' => $active,
            'completed' => $completed,
            'totalSpent' => $totalSpent,
        ];
    }
}
