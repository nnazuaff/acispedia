<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBalance;
use App\Models\WalletLedger;
use App\Support\AdminActivity;
use App\Support\PhoneNormalizer;
use App\Support\WalletLedgerWriter;
use Illuminate\Database\Eloquent\Builder;
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
        $id = trim((string) $request->query('id', ''));
        $idInt = null;
        if ($id !== '' && ctype_digit($id)) {
            $idInt = (int) $id;
        } else {
            $id = '';
        }
        $status = strtolower(trim((string) $request->query('status', '')));
        if (! in_array($status, ['active', 'inactive', 'banned'], true)) {
            $status = '';
        }

        $perPage = (int) $request->query('per_page', 25);
        if (! in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $query = User::query()->with(['balanceRow:user_id,balance,total_spent,total_deposit']);

        if ($idInt !== null) {
            $query->where('id', $idInt);
        }

        if ($q !== '') {
            $query->where(function (Builder $uq) use ($q) {
                $uq->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('id', $q);
            });
        }

        if ($status !== '') {
            if ($status === 'active') {
                $query->where(function (Builder $sq) {
                    $sq->whereNull('account_status')
                        ->orWhere('account_status', '')
                        ->orWhere('account_status', 'active');
                });
            } else {
                $query->where('account_status', $status);
            }
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
                'account_status' => (string) ($user->account_status ?? 'active'),
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
                'id' => $id,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        $user->loadMissing(['balanceRow:user_id,balance,total_spent,total_deposit']);

        $allowedPerPage = [25, 50, 100, 200];
        $ledgerPerPage = (int) $request->integer('ledger_per_page', 25);
        if (! in_array($ledgerPerPage, $allowedPerPage, true)) {
            $ledgerPerPage = 25;
        }

        $ledger = WalletLedger::query()
            ->where('user_id', (int) $user->id)
            ->orderByDesc('event_at')
            ->orderByDesc('id')
            ->paginate($ledgerPerPage, ['direction', 'amount', 'balance_before', 'balance_after', 'source_type', 'source_id', 'description', 'event_at'], 'ledger_page')
            ->withQueryString()
            ->through(fn (WalletLedger $row) => [
                'event_at_wib' => $row->event_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'direction' => (string) ($row->direction ?? ''),
                'amount' => (int) ($row->amount ?? 0),
                'balance_before' => (int) ($row->balance_before ?? 0),
                'balance_after' => (int) ($row->balance_after ?? 0),
                'source_type' => (string) ($row->source_type ?? ''),
                'source_id' => $row->source_id !== null ? (string) $row->source_id : null,
                'description' => (string) ($row->description ?? ''),
            ]);

        return Inertia::render('admin/user-detail', [
            'user' => [
                'id' => (int) $user->id,
                'name' => (string) ($user->name ?? ''),
                'email' => (string) ($user->email ?? ''),
                'phone' => $user->phone !== null ? (string) $user->phone : null,
                'account_status' => (string) ($user->account_status ?? 'active'),
                'created_at_wib' => $user->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'updated_at_wib' => $user->updated_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'last_login_at_wib' => $user->last_login_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'last_activity_at_wib' => $user->last_activity_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'balance' => (int) ($user->balanceRow?->balance ?? 0),
                'total_spent' => (int) ($user->balanceRow?->total_spent ?? 0),
                'total_deposit' => (int) ($user->balanceRow?->total_deposit ?? 0),
            ],
            'ledger' => $ledger,
            'filters' => [
                'ledger_per_page' => $ledgerPerPage,
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
                'account_status' => (string) ($user->account_status ?? 'active'),
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
        ], [
            'email.unique' => 'Email sudah digunakan.',
            'email.email' => 'Email tidak valid.',
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
                ]);

                // Admin-created accounts are considered ready-to-use.
                // `email_verified_at` is not fillable, so set it explicitly.
                $user->forceFill(['email_verified_at' => now()])->save();

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

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User berhasil dibuat.']);

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
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Nominal harus lebih dari 0.']);

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
                Inertia::flash('toast', ['type' => 'error', 'message' => 'Saldo user tidak cukup untuk dikurangi.']);

                return back()->with('error', 'Saldo user tidak cukup untuk dikurangi.');
            }
            report($e);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal mengatur saldo user.']);

            return back()->with('error', 'Gagal mengatur saldo user.');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Saldo user berhasil diperbarui.']);

        return back()->with('success', 'Saldo user berhasil diperbarui.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore((int) $user->id)],
            'phone' => ['nullable', 'string', 'max:32'],
            'account_status' => ['required', 'string', Rule::in(['active', 'inactive', 'banned'])],
        ], [
            'email.unique' => 'Email sudah digunakan.',
            'email.email' => 'Email tidak valid.',
        ]);

        $normalizedPhone = PhoneNormalizer::digitsOnly($validated['phone'] ?? null);
        if ($normalizedPhone === '') {
            $normalizedPhone = null;
        }

        $before = [
            'name' => (string) ($user->name ?? ''),
            'email' => (string) ($user->email ?? ''),
            'phone' => $user->phone !== null ? (string) $user->phone : null,
            'account_status' => (string) ($user->account_status ?? 'active'),
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
                $row->account_status = (string) $validated['account_status'];
                $row->save();
            });
        } catch (Throwable $e) {
            report($e);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal menyimpan perubahan user.']);

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
                    'account_status' => (string) ($user->account_status ?? 'active'),
                ],
            ]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User diperbarui.']);

        return redirect()->route('admin.users.show', ['user' => $user->id])->with('success', 'User diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $protectedEmails = array_map('strtolower', (array) config('admin.emails', []));
        $email = (string) ($user->email ?? '');

        if ($email !== '' && in_array(strtolower($email), $protectedEmails, true)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Akun admin yang di-allowlist tidak bisa dihapus.']);

            return back()->with('error', 'Akun admin yang di-allowlist tidak bisa dihapus.');
        }

        if ((int) $request->user()?->id === (int) $user->id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Tidak bisa menghapus akun sendiri.']);

            return back()->with('error', 'Tidak bisa menghapus akun sendiri.');
        }

        $id = (int) $user->id;
        $name = (string) ($user->name ?? '');

        try {
            $user->delete();
        } catch (Throwable $e) {
            report($e);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal menghapus user.']);

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

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User dihapus.']);

        return redirect()->route('admin.users')->with('success', 'User dihapus.');
    }
}
