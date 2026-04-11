<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Order;
use App\Models\User;
use App\Models\UserBalance;
use App\Models\UserActivityLog;
use App\Models\WalletLedger;
use App\Support\AdminActivity;
use App\Support\PhoneNormalizer;
use App\Support\WalletLedgerWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UsersController extends Controller
{
    use PasswordValidationRules;

    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $query = User::query()->with(['balanceRow:user_id,balance,total_spent,total_deposit']);

        if ($q !== '') {
            $query->where(function ($uq) use ($q) {
                $uq->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('id', $q);
            });
        }

        $protectedEmails = array_map('strtolower', (array) config('admin.emails', []));

        $paginator = $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $rows = $paginator->getCollection()->map(function (User $user) use ($protectedEmails) {
            $email = (string) ($user->email ?? '');
            $isProtectedAdmin = $email !== '' && in_array(strtolower($email), $protectedEmails, true);

            return [
                'id' => (int) $user->id,
                'name' => (string) ($user->name ?? ''),
                'email' => $email,
                'phone' => $user->phone !== null ? (string) $user->phone : null,
                'created_at_wib' => $user->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'last_activity_at_wib' => $user->last_activity_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'balance' => (int) ($user->balanceRow?->balance ?? 0),
                'total_spent' => (int) ($user->balanceRow?->total_spent ?? 0),
                'total_deposit' => (int) ($user->balanceRow?->total_deposit ?? 0),
                'is_admin_protected' => $isProtectedAdmin,
            ];
        })->all();

        $paginator->setCollection(collect($rows));

        $stats = [
            'total_users' => (int) (clone $query)->count(),
            'total_balance' => (int) UserBalance::query()->sum('balance'),
        ];

        return Inertia::render('admin/users', [
            'users' => $paginator,
            'stats' => $stats,
            'filters' => [
                'q' => $q,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        $user->loadMissing(['balanceRow:user_id,balance,total_spent,total_deposit']);

        $allowedPerPage = [25, 50, 100, 200];
        $ordersPerPage = (int) $request->integer('orders_per_page', 25);
        if (! in_array($ordersPerPage, $allowedPerPage, true)) {
            $ordersPerPage = 25;
        }
        $depositsPerPage = (int) $request->integer('deposits_per_page', 25);
        if (! in_array($depositsPerPage, $allowedPerPage, true)) {
            $depositsPerPage = 25;
        }

        $activityPerPage = (int) $request->integer('activity_per_page', 25);
        if (! in_array($activityPerPage, $allowedPerPage, true)) {
            $activityPerPage = 25;
        }

        $ledger = [];
        try {
            $ledger = WalletLedger::query()
                ->where('user_id', (int) $user->id)
                ->orderByDesc('event_at')
                ->orderByDesc('id')
                ->limit(50)
                ->get(['direction', 'amount', 'balance_before', 'balance_after', 'source_type', 'source_id', 'description', 'event_at'])
                ->map(fn (WalletLedger $row) => [
                    'event_at_wib' => $row->event_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                    'direction' => (string) ($row->direction ?? ''),
                    'amount' => (int) ($row->amount ?? 0),
                    'balance_before' => (int) ($row->balance_before ?? 0),
                    'balance_after' => (int) ($row->balance_after ?? 0),
                    'source_type' => (string) ($row->source_type ?? ''),
                    'source_id' => $row->source_id !== null ? (string) $row->source_id : null,
                    'description' => (string) ($row->description ?? ''),
                ])
                ->all();
        } catch (Throwable $e) {
            report($e);
            $ledger = [];
        }

        $orders = Order::query()
            ->where('user_id', (int) $user->id)
            ->orderByDesc('id')
            ->paginate($ordersPerPage, ['id', 'service_name', 'target', 'total_price', 'status', 'created_at'], 'orders_page')
            ->withQueryString()
            ->through(fn (Order $o) => [
                'id' => (int) $o->id,
                'service_name' => (string) ($o->service_name ?? ''),
                'target' => (string) ($o->target ?? ''),
                'total_price' => (int) ($o->total_price ?? 0),
                'status' => (string) ($o->status ?? ''),
                'created_at_wib' => $o->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
            ]);

        $deposits = Deposit::query()
            ->where('user_id', (int) $user->id)
            ->orderByDesc('id')
            ->paginate($depositsPerPage, ['id', 'amount', 'final_amount', 'status', 'payment_method', 'tripay_method', 'created_at'], 'deposits_page')
            ->withQueryString()
            ->through(fn (Deposit $d) => [
                'id' => (int) $d->id,
                'amount' => (int) ($d->amount ?? 0),
                'final_amount' => (int) ($d->final_amount ?? 0),
                'status' => (string) ($d->status ?? ''),
                'payment_method' => (string) ($d->payment_method ?? ''),
                'tripay_method' => $d->tripay_method !== null ? (string) $d->tripay_method : null,
                'created_at_wib' => $d->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
            ]);

        $activity = UserActivityLog::query()
            ->where('user_id', (int) $user->id)
            ->orderByDesc('id')
            ->paginate($activityPerPage, ['id', 'action', 'message', 'ip', 'meta', 'created_at'], 'activity_page')
            ->withQueryString()
            ->through(fn (UserActivityLog $r) => [
                'id' => (int) $r->id,
                'action' => (string) ($r->action ?? ''),
                'message' => (string) ($r->message ?? ''),
                'ip' => $r->ip !== null ? (string) $r->ip : null,
                'created_at_wib' => $r->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'meta' => is_array($r->meta) ? $r->meta : null,
            ]);

        return Inertia::render('admin/user-detail', [
            'user' => [
                'id' => (int) $user->id,
                'name' => (string) ($user->name ?? ''),
                'email' => (string) ($user->email ?? ''),
                'phone' => $user->phone !== null ? (string) $user->phone : null,
                'created_at_wib' => $user->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'updated_at_wib' => $user->updated_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'last_login_at_wib' => $user->last_login_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'last_activity_at_wib' => $user->last_activity_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'balance' => (int) ($user->balanceRow?->balance ?? 0),
                'total_spent' => (int) ($user->balanceRow?->total_spent ?? 0),
                'total_deposit' => (int) ($user->balanceRow?->total_deposit ?? 0),
            ],
            'orders' => $orders,
            'deposits' => $deposits,
            'activity' => $activity,
            'ledger' => $ledger,
            'filters' => [
                'orders_per_page' => $ordersPerPage,
                'deposits_per_page' => $depositsPerPage,
                'activity_per_page' => $activityPerPage,
            ],
        ]);
    }

    public function edit(Request $request, User $user): Response
    {
        return Inertia::render('admin/user-edit', [
            'user' => [
                'id' => (int) $user->id,
                'name' => (string) ($user->name ?? ''),
                'email' => (string) ($user->email ?? ''),
                'phone' => $user->phone !== null ? (string) $user->phone : null,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('admin/user-create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:32'],
            'password' => $this->passwordRules(),
        ]);

        $normalizedPhone = PhoneNormalizer::digitsOnly($validated['phone'] ?? null);
        if ($normalizedPhone === '') {
            $normalizedPhone = null;
        }

        $createdUserId = null;

        try {
            DB::transaction(function () use ($validated, $normalizedPhone, &$createdUserId) {
                $user = User::query()->create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $normalizedPhone,
                    'password' => Hash::make((string) $validated['password']),
                    // Admin-created accounts are considered ready-to-use.
                    'email_verified_at' => now(),
                ]);

                UserBalance::query()->create([
                    'user_id' => (int) $user->id,
                    'balance' => 0,
                    'total_spent' => 0,
                    'total_deposit' => 0,
                ]);

                $createdUserId = (int) $user->id;
            });
        } catch (Throwable $e) {
            report($e);
            return back()->with('error', 'Gagal membuat user.');
        }

        AdminActivity::log(
            $request,
            'user_create',
            'user',
            $createdUserId !== null ? (string) $createdUserId : null,
            'Create user',
            [
                'user' => [
                    'id' => $createdUserId,
                    'email' => (string) $validated['email'],
                    'name' => (string) $validated['name'],
                ],
            ]
        );

        return redirect()->route('admin.users')->with('success', 'User berhasil dibuat.');
    }

    public function adjustBalance(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'string', Rule::in(['add', 'subtract', 'set'])],
            'amount' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $mode = (string) $validated['mode'];
        $amount = (int) $validated['amount'];
        $note = isset($validated['note']) ? trim((string) $validated['note']) : null;

        if (in_array($mode, ['add', 'subtract'], true) && $amount < 1) {
            return back()->with('error', 'Nominal harus lebih dari 0.');
        }

        try {
            DB::transaction(function () use ($user, $mode, $amount, $note, $request) {
                $balanceRow = UserBalance::query()->lockForUpdate()->firstOrCreate(
                    ['user_id' => (int) $user->id],
                    ['balance' => 0, 'total_spent' => 0, 'total_deposit' => 0]
                );

                $beforeBalance = (int) ($balanceRow->balance ?? 0);
                $beforeTotalDeposit = (int) ($balanceRow->total_deposit ?? 0);

                $afterBalance = $beforeBalance;
                $afterTotalDeposit = $beforeTotalDeposit;
                $direction = 'credit';
                $ledgerAmount = 0;
                $description = 'Admin adjustment';

                if ($mode === 'add') {
                    $afterBalance = $beforeBalance + $amount;
                    $afterTotalDeposit = $beforeTotalDeposit + $amount;
                    $direction = 'credit';
                    $ledgerAmount = $amount;
                    $description = 'Tambah saldo (admin)';
                } elseif ($mode === 'subtract') {
                    if ($beforeBalance < $amount) {
                        throw new \RuntimeException('INSUFFICIENT_BALANCE');
                    }
                    $afterBalance = $beforeBalance - $amount;
                    $direction = 'debit';
                    $ledgerAmount = $amount;
                    $description = 'Kurangi saldo (admin)';
                } else {
                    // set
                    $afterBalance = max(0, $amount);
                    $diff = $afterBalance - $beforeBalance;
                    $direction = $diff >= 0 ? 'credit' : 'debit';
                    $ledgerAmount = (int) abs($diff);
                    $description = 'Set saldo (admin)';
                }

                $balanceRow->balance = $afterBalance;
                $balanceRow->total_deposit = $afterTotalDeposit;
                $balanceRow->save();

                if ($ledgerAmount > 0) {
                    try {
                        WalletLedgerWriter::record(
                            (int) $user->id,
                            $direction,
                            $ledgerAmount,
                            $beforeBalance,
                            (int) $balanceRow->balance,
                            'admin_adjustment',
                            (string) $request->user()?->id,
                            $description,
                            [
                                'mode' => $mode,
                                'note' => $note,
                                'before_total_deposit' => $beforeTotalDeposit,
                                'after_total_deposit' => (int) $balanceRow->total_deposit,
                            ],
                            now(),
                        );
                    } catch (Throwable $e) {
                        report($e);
                        // Don't block the balance update if ledger is unavailable.
                    }
                }

                AdminActivity::log(
                    $request,
                    'user_balance_adjust',
                    'user',
                    (string) $user->id,
                    'Adjust user balance',
                    [
                        'mode' => $mode,
                        'amount' => $amount,
                        'note' => $note,
                        'before' => [
                            'balance' => $beforeBalance,
                            'total_deposit' => $beforeTotalDeposit,
                        ],
                        'after' => [
                            'balance' => (int) ($balanceRow->balance ?? 0),
                            'total_deposit' => (int) ($balanceRow->total_deposit ?? 0),
                        ],
                    ]
                );
            });
        } catch (Throwable $e) {
            if ($e instanceof \RuntimeException && $e->getMessage() === 'INSUFFICIENT_BALANCE') {
                return back()->with('error', 'Saldo user tidak cukup untuk dikurangi.');
            }
            report($e);
            return back()->with('error', 'Gagal mengatur saldo user.');
        }

        return back()->with('success', 'Saldo user berhasil diperbarui.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore((int) $user->id)],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        $normalizedPhone = PhoneNormalizer::digitsOnly($validated['phone'] ?? null);
        if ($normalizedPhone === '') {
            $normalizedPhone = null;
        }

        $before = [
            'name' => (string) ($user->name ?? ''),
            'email' => (string) ($user->email ?? ''),
            'phone' => $user->phone !== null ? (string) $user->phone : null,
        ];

        try {
            DB::transaction(function () use ($user, $validated, $normalizedPhone) {
                $row = User::query()->lockForUpdate()->find((int) $user->id);
                if (! $row) {
                    return;
                }

                $row->name = $validated['name'];
                if ((string) $row->email !== (string) $validated['email']) {
                    $row->email = (string) $validated['email'];
                    $row->email_verified_at = now();
                }
                $row->phone = $normalizedPhone;
                $row->save();
            });
        } catch (Throwable $e) {
            report($e);
            return back()->with('error', 'Gagal menyimpan perubahan user.');
        }

        $user->refresh();

        AdminActivity::log(
            $request,
            'user_update',
            'user',
            (string) $user->id,
            'Update user',
            [
                'before' => $before,
                'after' => [
                    'name' => (string) ($user->name ?? ''),
                    'email' => (string) ($user->email ?? ''),
                    'phone' => $user->phone !== null ? (string) $user->phone : null,
                ],
            ]
        );

        return redirect()->route('admin.users.show', ['user' => $user->id])->with('success', 'User diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $protectedEmails = array_map('strtolower', (array) config('admin.emails', []));
        $email = (string) ($user->email ?? '');

        if ($email !== '' && in_array(strtolower($email), $protectedEmails, true)) {
            return back()->with('error', 'Akun admin yang di-allowlist tidak bisa dihapus.');
        }

        if ((int) $request->user()?->id === (int) $user->id) {
            return back()->with('error', 'Tidak bisa menghapus akun sendiri.');
        }

        $id = (int) $user->id;
        $name = (string) ($user->name ?? '');

        try {
            $user->delete();
        } catch (Throwable $e) {
            report($e);
            return back()->with('error', 'Gagal menghapus user.');
        }

        AdminActivity::log(
            $request,
            'user_delete',
            'user',
            (string) $id,
            'Delete user',
            [
                'user' => [
                    'id' => $id,
                    'email' => $email,
                    'name' => $name,
                ],
            ]
        );

        return redirect()->route('admin.users')->with('success', 'User dihapus.');
    }
}
