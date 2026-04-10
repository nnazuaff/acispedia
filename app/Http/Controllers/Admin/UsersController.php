<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Order;
use App\Models\User;
use App\Models\UserBalance;
use App\Support\AdminActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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

        $latestOrders = Order::query()
            ->where('user_id', (int) $user->id)
            ->orderByDesc('id')
            ->limit(10)
            ->get(['id', 'service_name', 'target', 'total_price', 'status', 'created_at']);

        $latestDeposits = Deposit::query()
            ->where('user_id', (int) $user->id)
            ->orderByDesc('id')
            ->limit(10)
            ->get(['id', 'amount', 'final_amount', 'status', 'payment_method', 'tripay_method', 'created_at']);

        return Inertia::render('admin/user-detail', [
            'user' => [
                'id' => (int) $user->id,
                'name' => (string) ($user->name ?? ''),
                'email' => (string) ($user->email ?? ''),
                'phone' => $user->phone !== null ? (string) $user->phone : null,
                'created_at_wib' => $user->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'updated_at_wib' => $user->updated_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'balance' => (int) ($user->balanceRow?->balance ?? 0),
                'total_spent' => (int) ($user->balanceRow?->total_spent ?? 0),
                'total_deposit' => (int) ($user->balanceRow?->total_deposit ?? 0),
            ],
            'latest_orders' => $latestOrders->map(fn (Order $o) => [
                'id' => (int) $o->id,
                'service_name' => (string) ($o->service_name ?? ''),
                'target' => (string) ($o->target ?? ''),
                'total_price' => (int) ($o->total_price ?? 0),
                'status' => (string) ($o->status ?? ''),
                'created_at_wib' => $o->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
            ])->all(),
            'latest_deposits' => $latestDeposits->map(fn (Deposit $d) => [
                'id' => (int) $d->id,
                'amount' => (int) ($d->amount ?? 0),
                'final_amount' => (int) ($d->final_amount ?? 0),
                'status' => (string) ($d->status ?? ''),
                'payment_method' => (string) ($d->payment_method ?? ''),
                'tripay_method' => $d->tripay_method !== null ? (string) $d->tripay_method : null,
                'created_at_wib' => $d->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
            ])->all(),
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

        $createdUserId = null;

        try {
            DB::transaction(function () use ($validated, &$createdUserId) {
                $user = User::query()->create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
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

    public function addBalance(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1', 'max:1000000000'],
        ]);

        $amount = (int) $validated['amount'];

        try {
            DB::transaction(function () use ($user, $amount, $request) {
                $balanceRow = UserBalance::query()->lockForUpdate()->firstOrCreate(
                    ['user_id' => (int) $user->id],
                    ['balance' => 0, 'total_spent' => 0, 'total_deposit' => 0]
                );

                $beforeBalance = (int) ($balanceRow->balance ?? 0);
                $beforeTotalDeposit = (int) ($balanceRow->total_deposit ?? 0);

                $balanceRow->balance = $beforeBalance + $amount;
                $balanceRow->total_deposit = $beforeTotalDeposit + $amount;
                $balanceRow->save();

                AdminActivity::log(
                    $request,
                    'user_balance_add',
                    'user',
                    (string) $user->id,
                    'Add user balance',
                    [
                        'amount' => $amount,
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
            report($e);
            return back()->with('error', 'Gagal menambah saldo user.');
        }

        return back()->with('success', 'Saldo berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        $before = [
            'name' => (string) ($user->name ?? ''),
            'phone' => $user->phone !== null ? (string) $user->phone : null,
        ];

        try {
            DB::transaction(function () use ($user, $validated) {
                $row = User::query()->lockForUpdate()->find((int) $user->id);
                if (! $row) {
                    return;
                }

                $row->name = $validated['name'];
                $row->phone = $validated['phone'] ?? null;
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
