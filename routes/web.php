<?php

use App\Http\Controllers\Api\BalanceController;
use App\Http\Controllers\Api\DepositsController;
use App\Http\Controllers\Api\MedanpediaController;
use App\Http\Controllers\Api\OrdersController;
use App\Http\Controllers\Admin\ActivityLogsController as AdminActivityLogsController;
use App\Http\Controllers\Admin\AdminUsersController as AdminAdminUsersController;
use App\Http\Controllers\Admin\ConnectionsController as AdminConnectionsController;
use App\Http\Controllers\Admin\DepositsController as AdminDepositsController;
use App\Http\Controllers\Admin\FinancialReportController as AdminFinancialReportController;
use App\Http\Controllers\Admin\OrdersController as AdminOrdersController;
use App\Http\Controllers\Admin\ServicesController as AdminServicesController;
use App\Http\Controllers\Admin\UserActivityLogsController as AdminUserActivityLogsController;
use App\Http\Controllers\Admin\UsersController as AdminUsersController;
use App\Http\Controllers\Admin\SuggestionsController as AdminSuggestionsController;
use App\Http\Controllers\Auth\CleanPasswordResetController;
use App\Http\Controllers\Auth\GuestEmailVerificationController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\SuggestionBoxController;
use App\Models\Deposit;
use App\Models\Order;
use App\Models\User;
use App\Services\DashboardStats;
use App\Support\WibDateRange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;

$adminDomain = (string) config('admin.domain', '');

Route::get('favicon.ico', function () {
    $v = @filemtime(public_path('favicon.png')) ?: '1';
    return redirect('/favicon.png?v='.$v);
})->name('favicon');

Route::get('apple-touch-icon.png', function () {
    $v = @filemtime(public_path('favicon.png')) ?: '1';
    return redirect('/favicon.png?v='.$v);
});

Route::get('sitemap.xml', function () {
    $urls = [
        url('/'),
        url('/services'),
        url('/terms'),
        url('/privacy'),
        url('/contact'),
        url('/target-guide'),
        url('/penjelasan-status-layanan'),
    ];

    $lastmod = now()->toAtomString();
    $escape = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8');

    $xml = '<?xml version="1.0" encoding="UTF-8"?>'
        .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    foreach ($urls as $loc) {
        $xml .= '<url>'
            .'<loc>'.$escape($loc).'</loc>'
            .'<lastmod>'.$escape($lastmod).'</lastmod>'
            .'</url>';
    }

    $xml .= '</urlset>';

    return response($xml, 200)->header('Content-Type', 'application/xml');
})->name('sitemap');

if ($adminDomain !== '') {
    Route::domain($adminDomain)
        ->middleware(['auth', 'verified', 'admin'])
        ->group(function (): void {
            Route::redirect('/', 'dashboard');

            Route::get('dashboard', function () {
                $range = WibDateRange::resolve();
                $start = $range['start_utc'];
                $end = $range['end_utc'];

                $stats = [
                    'users_today' => User::query()->whereBetween('created_at', [$start, $end])->count(),
                    'orders_today' => Order::query()->whereBetween('created_at', [$start, $end])->count(),
                    'deposit_success_count_today' => Deposit::query()
                        ->where('status', 'success')
                        ->whereBetween('created_at', [$start, $end])
                        ->count(),
                    'deposit_success_sum_today' => (int) Deposit::query()
                        ->where('status', 'success')
                        ->whereBetween('created_at', [$start, $end])
                        ->sum('amount'),
                ];

                $recentOrders = Order::query()
                    ->with(['user:id,name,email'])
                    ->whereBetween('created_at', [$start, $end])
                    ->orderByDesc('id')
                    ->limit(10)
                    ->get([
                        'id',
                        'user_id',
                        'service_name',
                        'quantity',
                        'total_price',
                        'status',
                        'created_at',
                    ])
                    ->map(function (Order $order): array {
                        return [
                            'id' => $order->id,
                            'created_at' => $order->created_at?->toISOString(),
                            'created_at_wib' => $order->created_at?->timezone('Asia/Jakarta')->format('Y-m-d H:i'),
                            'service_name' => $order->service_name,
                            'quantity' => $order->quantity,
                            'total_price' => $order->total_price,
                            'status' => $order->status,
                            'user' => $order->user
                                ? [
                                    'id' => $order->user->id,
                                    'name' => $order->user->name,
                                    'email' => $order->user->email,
                                ]
                                : null,
                        ];
                    })
                    ->values();

                return Inertia::render('admin/dashboard', [
                    'stats' => $stats,
                    'recentOrders' => $recentOrders,
                ]);
            })->name('admin.dashboard');

            Route::get('financial-report', [AdminFinancialReportController::class, 'index'])->name('admin.financial-report');
            Route::post('financial-report', [AdminFinancialReportController::class, 'store'])->name('admin.financial-report.store');
            Route::put('financial-report/{financialReport}', [AdminFinancialReportController::class, 'update'])->name('admin.financial-report.update');
            Route::delete('financial-report/{financialReport}', [AdminFinancialReportController::class, 'destroy'])->name('admin.financial-report.destroy');

            Route::get('orders', [AdminOrdersController::class, 'index'])->name('admin.orders');
            Route::get('orders/{order}', [AdminOrdersController::class, 'show'])->name('admin.orders.show');
            Route::post('orders/{order}/status', [AdminOrdersController::class, 'updateStatus'])->name('admin.orders.status');

            Route::get('deposits', [AdminDepositsController::class, 'index'])->name('admin.deposits');
            Route::get('deposits/{deposit}', [AdminDepositsController::class, 'show'])->name('admin.deposits.show');
            Route::post('deposits/{deposit}/status', [AdminDepositsController::class, 'updateStatus'])->name('admin.deposits.status');

            Route::get('users', [AdminUsersController::class, 'index'])->name('admin.users');
            Route::get('users/create', [AdminUsersController::class, 'create'])->name('admin.users.create');
            Route::post('users', [AdminUsersController::class, 'store'])->name('admin.users.store');
            Route::get('users/{user}', [AdminUsersController::class, 'show'])->name('admin.users.show');
            Route::get('users/{user}/edit', [AdminUsersController::class, 'edit'])->name('admin.users.edit');
            Route::put('users/{user}', [AdminUsersController::class, 'update'])->name('admin.users.update');
            Route::post('users/{user}/balance', [AdminUsersController::class, 'adjustBalance'])->name('admin.users.balance.adjust');
            Route::delete('users/{user}', [AdminUsersController::class, 'destroy'])->name('admin.users.destroy');

            Route::get('services', [AdminServicesController::class, 'index'])->name('admin.services');
            Route::get('connections', [AdminConnectionsController::class, 'index'])->name('admin.connections');
            Route::post('connections/markup', [AdminConnectionsController::class, 'updateMarkup'])->name('admin.connections.markup');
            Route::get('activity-logs', [AdminActivityLogsController::class, 'index'])->name('admin.activity-logs');
               Route::get('user-activity-logs', [AdminUserActivityLogsController::class, 'index'])->name('admin.user-activity-logs');
            Route::get('admin-users', [AdminAdminUsersController::class, 'index'])->name('admin.admin-users');

            Route::get('kotak-saran', [AdminSuggestionsController::class, 'index'])->name('admin.kotak-saran');
            Route::post('kotak-saran/{suggestion}/mark-done', [AdminSuggestionsController::class, 'markDone'])
                ->name('admin.kotak-saran.mark-done');
        });
}

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
    Route::get('reset-password-link/{key}', [CleanPasswordResetController::class, 'link'])
        ->name('password.reset.link');

    Route::get('reset-password', [CleanPasswordResetController::class, 'show'])
        ->name('password.reset.clean');

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

Route::get('kotak-saran', [SuggestionBoxController::class, 'index'])->name('kotak-saran');

Route::inertia('privacy', 'public/privacy')->name('privacy');

Route::get('panduan-target', function () {
    if (request()->user()) {
        return Inertia::render('target_guide');
    }

    return Inertia::render('public/target-guide', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('target.guide');

Route::get('penjelasan-status-layanan', function () {
    if (request()->user()) {
        return Inertia::render('service-status-explanation');
    }

    return Inertia::render('public/service-status-explanation', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('service.status.explanation');

Route::get('services', function () {
    if (request()->user()) {
        return Inertia::render('services');
    }

    return Inertia::render('public/services', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('services');

Route::get('contact', function () {
    if (request()->user()) {
        return Inertia::render('contact');
    }

    return Inertia::render('public/contact', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('contact');

Route::redirect('kontak', 'contact', 301);

Route::get('api/services', [MedanpediaController::class, 'services'])->name('api.medanpedia.services');

// Tripay callback (no auth; CSRF excluded in bootstrap/app.php)
Route::post('api/tripay/callback', [DepositsController::class, 'tripayCallback'])->name('api.tripay.callback');
Route::post('api/midtrans/callback', [DepositsController::class, 'midtransCallback'])->name('api.midtrans.callback');

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

    Route::post('api/deposits/midtrans', [DepositsController::class, 'storeMidtrans'])->name('api.deposits.midtrans.store');
    Route::post('api/deposits/tripay', [DepositsController::class, 'storeTripay'])->name('api.deposits.tripay.store');
    Route::post('api/deposits/konversi-saldo', [DepositsController::class, 'storeKonversiSaldo'])->name('api.deposits.konversi_saldo.store');
    Route::post('api/deposits/{deposit}/cancel', [DepositsController::class, 'cancel'])->name('api.deposits.cancel');

    Route::get('topup', function (Request $request) {
        $user = $request->user();
        $stats = $user ? DashboardStats::forUser((int) $user->id) : DashboardStats::empty();

        return Inertia::render('topup', [
            'balance' => (int) ($stats['balance'] ?? 0),
        ]);
    })->name('topup');

    Route::post('api/topup', [BalanceController::class, 'topup'])->name('api.balance.topup');

    Route::post('kotak-saran', [SuggestionBoxController::class, 'store'])->name('kotak-saran.store');
});

require __DIR__.'/settings.php';
