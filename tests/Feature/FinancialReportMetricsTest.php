<?php

use App\Models\Deposit;
use App\Models\Order;
use App\Models\User;
use App\Services\FinancialReportMetrics;
use App\Support\WibDateRange;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

test('wib date range resolves morning hours to the same indonesia date', function () {
    Carbon::setTestNow(Carbon::parse('2026-04-15 06:30:00', 'Asia/Jakarta'));

    $range = WibDateRange::resolve(WibDateRange::todayDateString(), WibDateRange::todayDateString());

    expect($range['date_from'])->toBe('2026-04-15')
        ->and($range['date_to'])->toBe('2026-04-15')
        ->and($range['start_utc']->format('Y-m-d H:i:s'))->toBe('2026-04-14 17:00:00')
        ->and($range['end_utc']->format('Y-m-d H:i:s'))->toBe('2026-04-15 16:59:59');

    Carbon::setTestNow();
});

test('financial report metrics use created date regardless of transaction status', function () {
    $user = User::factory()->create();

    Deposit::unguarded(function () use ($user) {
        Deposit::query()->create([
            'user_id' => $user->id,
            'amount' => 100000,
            'final_amount' => 100000,
            'payment_method' => 'midtrans',
            'status' => 'pending',
            'created_at' => '2026-04-14 18:30:00',
            'updated_at' => '2026-04-15 01:00:00',
            'processed_at' => '2026-04-15 01:00:00',
        ]);

        Deposit::query()->create([
            'user_id' => $user->id,
            'amount' => 50000,
            'final_amount' => 50000,
            'payment_method' => 'midtrans',
            'status' => 'success',
            'created_at' => '2026-04-15 18:00:00',
            'updated_at' => '2026-04-15 18:00:00',
        ]);
    });

    Order::unguarded(function () use ($user) {
        Order::query()->create([
            'user_id' => $user->id,
            'service_id' => 1,
            'service_name' => 'Instagram Likes',
            'base_price' => 4000,
            'price_per_1000' => 5000,
            'total_price' => 5000,
            'target' => 'https://example.com/post/1',
            'quantity' => 1000,
            'status' => 'Pending',
            'created_at' => '2026-04-14 22:15:00',
            'updated_at' => '2026-04-15 02:00:00',
        ]);

        Order::query()->create([
            'user_id' => $user->id,
            'service_id' => 2,
            'service_name' => 'Instagram Views',
            'base_price' => 3000,
            'price_per_1000' => 4500,
            'total_price' => 9000,
            'target' => 'https://example.com/post/2',
            'quantity' => 2000,
            'status' => 'Success',
            'created_at' => '2026-04-15 20:00:00',
            'updated_at' => '2026-04-15 20:10:00',
        ]);
    });

    $range = WibDateRange::resolve('2026-04-15', '2026-04-15');
    $summary = FinancialReportMetrics::summarize($range['start_utc'], $range['end_utc']);

    expect($summary['total_deposit'])->toBe(100000)
        ->and($summary['total_sales'])->toBe(5000)
        ->and($summary['net_profit'])->toBe(1000);
});
