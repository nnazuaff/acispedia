<?php

use App\Http\Controllers\Api\BalanceController;
use App\Http\Controllers\Api\DepositsController;
use App\Http\Controllers\Api\MedanpediaController;
use App\Http\Controllers\Api\OrdersController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\HistoryController;
use App\Services\DashboardStats;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('services', function () {
    if (request()->user()) {
        return Inertia::render('services');
    }

    return Inertia::render('public/services', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('services');

Route::get('api/services', [MedanpediaController::class, 'services'])->name('api.medanpedia.services');

// Tripay callback (no auth; CSRF excluded in bootstrap/app.php)
Route::post('api/tripay/callback', [DepositsController::class, 'tripayCallback'])->name('api.tripay.callback');

Route::middleware(['auth'])->group(function () {
    Broadcast::routes();
    Route::inertia('order', 'order')->name('order');
    Route::get('api/service/{id}', [MedanpediaController::class, 'service'])->name('api.medanpedia.service');
    Route::get('api/profile', [MedanpediaController::class, 'profile'])->name('api.medanpedia.profile');
    Route::post('api/orders', [OrdersController::class, 'store'])->name('api.orders.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        $user = $request->user();
        $stats = $user ? DashboardStats::forUser((int) $user->id) : DashboardStats::empty();

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    })->name('dashboard');

    Route::redirect('transactions', 'history/transaction');

    Route::get('history/transaction', [HistoryController::class, 'transaction'])->name('history.transaction');
    Route::get('history/transaction/{order}', [HistoryController::class, 'transactionShow'])->name('history.transaction.show');
    Route::get('history/deposit', [HistoryController::class, 'deposit'])->name('history.deposit');
    Route::get('history/deposit/{deposit}', [HistoryController::class, 'depositShow'])->name('history.deposit.show');

    Route::get('deposit', [DepositController::class, 'index'])->name('deposit');

    Route::post('api/deposits/tripay', [DepositsController::class, 'storeTripay'])->name('api.deposits.tripay.store');
    Route::post('api/deposits/{deposit}/cancel', [DepositsController::class, 'cancel'])->name('api.deposits.cancel');

    Route::get('topup', function (Request $request) {
        $user = $request->user();
        $stats = $user ? DashboardStats::forUser((int) $user->id) : DashboardStats::empty();

        return Inertia::render('topup', [
            'balance' => (int) ($stats['balance'] ?? 0),
        ]);
    })->name('topup');

    Route::post('api/topup', [BalanceController::class, 'topup'])->name('api.balance.topup');
});

require __DIR__.'/settings.php';
