<?php

use App\Http\Controllers\Api\BalanceController;
use App\Http\Controllers\Api\DepositsController;
use App\Http\Controllers\Api\MedanpediaController;
use App\Http\Controllers\Api\OrdersController;
use App\Http\Controllers\Auth\GuestEmailVerificationController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\HistoryController;
use App\Services\DashboardStats;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Support\Str;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('security-check', function (Request $request) {
    $code = strtoupper(Str::random(5));
    $request->session()->put('security_check_code', $code);

    $width = 140;
    $height = 44;
    $bg = '#ffffff';
    $fg = '#111827';

    $noise = '';
    for ($i = 0; $i < 6; $i++) {
        $x1 = random_int(0, $width);
        $y1 = random_int(0, $height);
        $x2 = random_int(0, $width);
        $y2 = random_int(0, $height);
        $opacity = random_int(10, 25) / 100;
        $noise .= "<line x1=\"{$x1}\" y1=\"{$y1}\" x2=\"{$x2}\" y2=\"{$y2}\" stroke=\"#6b7280\" stroke-width=\"1\" opacity=\"{$opacity}\" />";
    }

    $chars = str_split($code);
    $text = '';
    $x = 18;
    foreach ($chars as $ch) {
        $rotate = random_int(-18, 18);
        $y = random_int(28, 34);
        $text .= "<text x=\"{$x}\" y=\"{$y}\" font-family=\"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto\" font-size=\"22\" font-weight=\"700\" fill=\"{$fg}\" transform=\"rotate({$rotate} {$x} {$y})\">{$ch}</text>";
        $x += 22;
    }

    $svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{$width}\" height=\"{$height}\" viewBox=\"0 0 {$width} {$height}\"><rect width=\"100%\" height=\"100%\" rx=\"8\" fill=\"{$bg}\"/><g>{$noise}</g><g>{$text}</g></svg>";

    return response($svg, 200, [
        'Content-Type' => 'image/svg+xml; charset=UTF-8',
        'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma' => 'no-cache',
    ]);
})->name('security.check');

Route::middleware('guest')->group(function () {
    Route::get('verify-email', [GuestEmailVerificationController::class, 'notice'])->name('verify.email.notice');
    Route::post('verify-email/resend', [GuestEmailVerificationController::class, 'resend'])->name('verify.email.resend');
    Route::get('verify-email/{id}/{hash}', [GuestEmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verify.email.link');
});

Route::get('terms', function () {
    if (request()->user()) {
        return Inertia::render('terms');
    }

    return Inertia::render('public/terms', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('terms');

Route::inertia('privacy', 'public/privacy')->name('privacy');

Route::get('panduan-target', function () {
    if (request()->user()) {
        return Inertia::render('target_guide');
    }

    return Inertia::render('public/target-guide', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('target.guide');

Route::get('services', function () {
    if (request()->user()) {
        return Inertia::render('services');
    }

    return Inertia::render('public/services', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('services');

Route::get('kontak', function () {
    if (request()->user()) {
        return Inertia::render('contact');
    }

    return Inertia::render('public/contact', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('contact');

Route::get('api/services', [MedanpediaController::class, 'services'])->name('api.medanpedia.services');

// Tripay callback (no auth; CSRF excluded in bootstrap/app.php)
Route::post('api/tripay/callback', [DepositsController::class, 'tripayCallback'])->name('api.tripay.callback');

Route::middleware(['auth'])->group(function () {
    Broadcast::routes();
    Route::inertia('order', 'order')->name('order');
    Route::get('api/service/{id}', [MedanpediaController::class, 'service'])->name('api.medanpedia.service');
    Route::get('api/profile', [MedanpediaController::class, 'profile'])->name('api.medanpedia.profile');
    Route::post('api/orders', [OrdersController::class, 'store'])->name('api.orders.store');
    Route::inertia('verified', 'auth/verified')->name('verified.success');
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
