<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Throwable;

final class WibDateRange
{
    public const TIMEZONE = 'Asia/Jakarta';

    /**
     * @return array{
     *     start_wib: Carbon,
     *     end_wib: Carbon,
     *     start_utc: Carbon,
     *     end_utc: Carbon,
     *     date_from: string,
     *     date_to: string
     * }
     */
    public static function resolve(?string $dateFrom = null, ?string $dateTo = null): array
    {
        $todayWib = now(self::TIMEZONE);

        try {
            $startWib = Carbon::parse((string) $dateFrom, self::TIMEZONE)->startOfDay();
        } catch (Throwable) {
            $startWib = $todayWib->copy()->startOfDay();
        }

        try {
            $endWib = Carbon::parse((string) $dateTo, self::TIMEZONE)->endOfDay();
        } catch (Throwable) {
            $endWib = $todayWib->copy()->endOfDay();
        }

        if ($endWib->lt($startWib)) {
            [$startWib, $endWib] = [$endWib->copy()->startOfDay(), $startWib->copy()->endOfDay()];
        }

        return [
            'start_wib' => $startWib,
            'end_wib' => $endWib,
            'start_utc' => $startWib->copy()->setTimezone('UTC'),
            'end_utc' => $endWib->copy()->setTimezone('UTC'),
            'date_from' => $startWib->toDateString(),
            'date_to' => $endWib->toDateString(),
        ];
    }

    public static function todayDateString(): string
    {
        return now(self::TIMEZONE)->toDateString();
    }

    public static function currentMonthStartUtc(): Carbon
    {
        return now(self::TIMEZONE)->startOfMonth()->setTimezone('UTC');
    }
}
