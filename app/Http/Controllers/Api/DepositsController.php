<?php

namespace App\Http\Controllers\Api;

use App\Events\DashboardStatsUpdated;
use App\Events\DepositStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\UserBalance;
use App\Services\DashboardStats;
use App\Services\MidtransClient;
use App\Services\TelegramNotifier;
use App\Services\TripayClient;
use App\Support\PhoneNormalizer;
use App\Support\UserActivity;
use App\Support\WalletLedgerWriter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class DepositsController extends Controller
{
    public function storeKonversiSaldo(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->merge([
            'acispay_phone' => PhoneNormalizer::normalizeIdPhoneToLocalZero($request->input('acispay_phone')),
        ]);

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1000', 'max:200000000'],
            'acispay_phone' => ['required', 'string', 'regex:/^0[0-9]{9,15}$/'],
            'acispay_username' => ['required', 'string', 'min:3', 'max:64'],
        ]);

        $amount = (int) $validated['amount'];
        $acispayPhone = trim((string) $validated['acispay_phone']);
        $acispayUsername = trim((string) $validated['acispay_username']);

        $depositId = null;

        try {
            $depositId = DB::transaction(function () use ($user, $amount, $acispayPhone, $acispayUsername) {
                $activePending = Deposit::query()
                    ->where('user_id', (int) $user->id)
                    ->where('status', 'pending')
                    ->where(function (Builder $q) {
                        $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
                    })
                    ->exists();

                if ($activePending) {
                    throw new RuntimeException('Masih ada deposit pending. Selesaikan atau batalkan deposit sebelumnya.');
                }

                $payload = [
                    'type' => 'konversi_saldo',
                    'acispay_phone' => $acispayPhone,
                    'acispay_username' => $acispayUsername,
                    'manual' => true,
                    'submitted_at' => now()->toISOString(),
                ];

                $deposit = Deposit::query()->create([
                    'user_id' => (int) $user->id,
                    'amount' => $amount,
                    'final_amount' => $amount,
                    'payment_method' => 'konversi_saldo',
                    'status' => 'pending',
                    'provider_payload' => $payload,
                ]);

                return (int) $deposit->id;
            });

            if ($depositId !== null) {
                UserActivity::log(
                    $user,
                    'deposit_create',
                    'Buat deposit',
                    [
                        'deposit_id' => (int) $depositId,
                        'amount' => (int) $amount,
                        'method' => 'konversi_saldo',
                    ]
                );
            }

            // Best-effort Telegram notify (manual review needed by admin).
            try {
                $userLabel = trim((string) ($user?->name ?? ''));
                if ($userLabel === '') {
                    $userLabel = trim((string) ($user?->email ?? ''));
                }
                if ($userLabel === '') {
                    $userLabel = 'User #'.(string) ($user?->id ?? '-');
                }

                TelegramNotifier::sendMessage(
                    "[Konversi Saldo] Deposit baru (PENDING)\n".
                    "ID: #{$depositId}\n".
                    "User: {$userLabel}\n".
                    "Nominal: {$amount}\n".
                    "Acispay Phone: {$acispayPhone}\n".
                    "Acispay Username: {$acispayUsername}"
                );
            } catch (Throwable) {
                // best-effort
            }

            try {
                $fresh = Deposit::query()->find((int) $depositId);
                if ($fresh) {
                    broadcast(new DepositStatusUpdated($fresh));
                }
            } catch (Throwable) {
                // best-effort
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan konversi saldo dibuat. Menunggu konfirmasi admin.',
                'deposit_id' => (int) $depositId,
                'amount' => $amount,
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pengajuan konversi saldo.',
            ], 500);
        }
    }

    private static function normalizeTripayPhone(string $input): string
    {
        $raw = trim($input);
        if ($raw === '') {
            return '';
        }

        $raw = preg_replace('/[^0-9+]/', '', $raw) ?? '';
        $raw = trim($raw);

        // Tripay typically expects digits (no leading '+').
        if (str_starts_with($raw, '+')) {
            $raw = ltrim($raw, '+');
        }

        // Accept common Indonesian formats: 08xxxxxxxxxx or 62xxxxxxxxxxx
        if (str_starts_with($raw, '8')) {
            $raw = '0'.$raw;
        }

        return $raw;
    }

    private static function isValidTripayPhone(string $phone): bool
    {
        $phone = trim($phone);
        if ($phone === '') {
            return false;
        }

        if (! preg_match('/^(0|62)[0-9]{8,15}$/', $phone)) {
            return false;
        }

        $len = strlen($phone);

        return $len >= 10 && $len <= 18;
    }

    private function creditSuccessfulDeposit(Deposit $row, string $description, array $context = []): void
    {
        UserBalance::query()->firstOrCreate([
            'user_id' => (int) $row->user_id,
        ], [
            'balance' => 0,
            'total_spent' => 0,
            'total_deposit' => 0,
        ]);

        $bal = UserBalance::query()
            ->where('user_id', (int) $row->user_id)
            ->lockForUpdate()
            ->first();

        if (! $bal) {
            return;
        }

        $balanceBefore = (int) $bal->balance;
        $balanceAfter = $balanceBefore + (int) $row->amount;

        $bal->balance = $balanceAfter;
        $bal->total_deposit = (int) $bal->total_deposit + (int) $row->amount;
        $bal->save();

        WalletLedgerWriter::record(
            (int) $row->user_id,
            'credit',
            (int) $row->amount,
            (int) $balanceBefore,
            (int) $balanceAfter,
            'deposit',
            (string) $row->id,
            $description,
            $context,
            $row->processed_at,
        );
    }

    private function broadcastDepositUpdate(int $depositId): void
    {
        try {
            $fresh = Deposit::query()->find($depositId);
            if ($fresh) {
                broadcast(new DepositStatusUpdated($fresh));
            }
        } catch (Throwable) {
            // best-effort
        }
    }

    private function broadcastUserStats(int $userId): void
    {
        try {
            $stats = DashboardStats::forUser($userId);
            broadcast(new DashboardStatsUpdated($userId, $stats));
        } catch (Throwable) {
            // best-effort
        }
    }

    private static function mapMidtransStatus(string $transactionStatus, string $fraudStatus): string
    {
        return match ($transactionStatus) {
            'settlement' => 'success',
            'capture' => ($fraudStatus === '' || $fraudStatus === 'accept') ? 'success' : 'pending',
            'expire', 'expired' => 'expired',
            'cancel', 'deny', 'failure' => 'failed',
            default => 'pending',
        };
    }

    public function cancel(Request $request, Deposit $deposit): JsonResponse
    {
        $user = $request->user();

        if (! $user || (int) $deposit->user_id !== (int) $user->id) {
            abort(Response::HTTP_NOT_FOUND);
        }

        try {
            $changed = DB::transaction(function () use ($deposit) {
                $row = Deposit::query()->lockForUpdate()->find($deposit->id);
                if (! $row) {
                    return false;
                }

                if ($row->status !== 'pending') {
                    return false;
                }

                if ($row->processed_at !== null) {
                    return false;
                }

                // If already expired, let history expire handler take over.
                if ($row->expired_at !== null && $row->expired_at->isPast()) {
                    return false;
                }

                $row->status = 'canceled';
                $row->processed_at = now();

                $payload = is_array($row->provider_payload) ? $row->provider_payload : [];
                $payload['canceled_by_user_at'] = now()->toISOString();
                $row->provider_payload = $payload;

                $row->save();

                return true;
            });

            if (! $changed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Deposit tidak bisa dibatalkan.',
                ], 422);
            }

            try {
                $fresh = Deposit::query()->find((int) $deposit->id);
                if ($fresh) {
                    broadcast(new DepositStatusUpdated($fresh));
                }
            } catch (Throwable) {
                // best-effort
            }

            return response()->json([
                'success' => true,
                'message' => 'Deposit berhasil dibatalkan.',
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() !== '' ? $e->getMessage() : 'Gagal membatalkan deposit.',
            ], 500);
        }
    }

    public function storeMidtrans(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! MidtransClient::isEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Metode pembayaran Midtrans sedang dinonaktifkan sementara.',
            ], 422);
        }

        if (! MidtransClient::isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Midtrans belum dikonfigurasi. Lengkapi Server Key terlebih dahulu.',
            ], 422);
        }

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1000', 'max:200000000'],
            'channel' => ['nullable', 'string', 'min:2', 'max:32'],
        ]);

        $amount = (int) $validated['amount'];
        $requestedChannel = strtolower(trim((string) ($validated['channel'] ?? '')));
        $adminFee = max(0, (int) config('midtrans.admin_fee', 4000));
        $finalAmount = $amount + $adminFee;
        $orderId = 'DEP-'.(int) $user->id.'-'.now()->format('YmdHis').'-'.Str::upper(Str::random(6));
        $enabledPayments = [];

        $depositId = null;

        try {
            $depositId = DB::transaction(function () use ($user, $amount, $finalAmount) {
                $activePending = Deposit::query()
                    ->where('user_id', (int) $user->id)
                    ->where('status', 'pending')
                    ->where(function (Builder $q) {
                        $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
                    })
                    ->exists();

                if ($activePending) {
                    throw new RuntimeException('Masih ada deposit pending. Selesaikan atau tunggu expired.');
                }

                $deposit = Deposit::query()->create([
                    'user_id' => (int) $user->id,
                    'amount' => $amount,
                    'final_amount' => $finalAmount,
                    'payment_method' => 'midtrans',
                    'status' => 'pending',
                    'expired_at' => now()->addDay(),
                ]);

                return (int) $deposit->id;
            });

            if ($depositId !== null) {
                UserActivity::log(
                    $user,
                    'deposit_create',
                    'Buat deposit',
                    [
                        'deposit_id' => (int) $depositId,
                        'amount' => (int) $amount,
                        'method' => 'midtrans',
                        'order_id' => (string) $orderId,
                        'channel' => null,
                    ]
                );
            }

            $callbacks = array_filter([
                'finish' => trim((string) config('midtrans.finish_url', '')),
                'unfinish' => trim((string) config('midtrans.unfinish_url', '')),
                'error' => trim((string) config('midtrans.error_url', '')),
            ], static fn ($value) => $value !== '');

            $itemDetails = [[
                'id' => 'DEPOSIT',
                'name' => 'Deposit Saldo',
                'price' => $amount,
                'quantity' => 1,
            ]];

            if ($adminFee > 0) {
                $itemDetails[] = [
                    'id' => 'MIDTRANS-FEE',
                    'name' => 'Biaya Admin',
                    'price' => $adminFee,
                    'quantity' => 1,
                ];
            }

            $json = MidtransClient::createTransaction(
                $orderId,
                $finalAmount,
                [
                    'first_name' => (string) ($user->name ?? 'Customer'),
                    'email' => (string) ($user->email ?? ''),
                    'phone' => (string) ($user->phone ?? ''),
                ],
                $itemDetails,
                $callbacks,
                $enabledPayments
            );

            $snapToken = (string) (Arr::get($json, 'token') ?? '');
            $redirectUrl = (string) (Arr::get($json, 'redirect_url') ?? '');

            DB::transaction(function () use ($depositId, $json, $orderId, $requestedChannel, $adminFee, $redirectUrl, $snapToken) {
                $deposit = Deposit::query()->lockForUpdate()->find($depositId);
                if (! $deposit) {
                    return;
                }

                $deposit->provider_payload = array_filter([
                    'provider' => 'midtrans',
                    'order_id' => $orderId,
                    'requested_channel' => null,
                    'snap_token' => $snapToken !== '' ? $snapToken : null,
                    'redirect_url' => $redirectUrl !== '' ? $redirectUrl : null,
                    'admin_fee' => $adminFee,
                    'snap_response' => $json,
                ], static fn ($value) => $value !== null && $value !== '');

                $deposit->save();
            });

            if (is_int($depositId)) {
                $this->broadcastDepositUpdate((int) $depositId);
            }

            return response()->json([
                'success' => true,
                'message' => 'Deposit dibuat. Silakan lanjutkan pembayaran.',
                'payment_url' => $redirectUrl,
                'checkout_url' => $redirectUrl,
                'reference' => $orderId,
                'snap_token' => $snapToken,
                'amount' => $amount,
                'final_amount' => $finalAmount,
                'admin_fee' => $adminFee,
                'finish_url' => $callbacks['finish'] ?? null,
            ]);
        } catch (RuntimeException $e) {
            if (is_int($depositId)) {
                try {
                    Deposit::query()
                        ->where('id', $depositId)
                        ->where('status', 'pending')
                        ->update([
                            'status' => 'failed',
                            'processed_at' => now(),
                            'provider_payload' => [
                                'provider' => 'midtrans',
                                'order_id' => $orderId,
                                'requested_channel' => null,
                                'admin_fee' => $adminFee,
                                'error' => $e->getMessage(),
                            ],
                        ]);
                } catch (Throwable) {
                    // ignore
                }
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            report($e);

            if (is_int($depositId)) {
                try {
                    Deposit::query()
                        ->where('id', $depositId)
                        ->where('status', 'pending')
                        ->update([
                            'status' => 'failed',
                            'processed_at' => now(),
                            'provider_payload' => [
                                'provider' => 'midtrans',
                                'order_id' => $orderId,
                                'requested_channel' => $requestedChannel !== '' ? $requestedChannel : null,
                                'admin_fee' => $adminFee,
                                'error' => 'Gagal membuat transaksi pembayaran.',
                            ],
                        ]);
                } catch (Throwable) {
                    // ignore
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat deposit.',
            ], 500);
        }
    }

    public function storeTripay(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! TripayClient::isEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Metode pembayaran Tripay sedang dinonaktifkan sementara.',
            ], 422);
        }

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1000', 'max:200000000'],
            'method' => ['required', 'string', 'min:2', 'max:32'],
            'customer_phone' => ['nullable', 'string', 'min:10', 'max:20'],
        ]);

        $amount = (int) $validated['amount'];
        $method = strtoupper(trim((string) $validated['method']));

        $allowedMethods = ['QRIS2', 'OVO', 'DANA', 'SHOPEEPAY'];
        if (! in_array($method, $allowedMethods, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Metode pembayaran tidak tersedia.',
            ], 422);
        }

        $customerPhone = self::normalizeTripayPhone((string) ($validated['customer_phone'] ?? ''));
        if ($customerPhone === '') {
            $customerPhone = self::normalizeTripayPhone((string) ($user->phone ?? ''));
        }

        // E-Wallet methods are strict about customer phone validity.
        $isEwallet = in_array($method, ['OVO', 'DANA', 'SHOPEEPAY'], true);
        if ($isEwallet && ! self::isValidTripayPhone($customerPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor HP tidak valid untuk pembayaran E-Wallet. Perbarui nomor HP/WA di Settings → Profile.',
            ], 422);
        }

        // For non e-wallet (e.g. QRIS), still try to send a sane phone if available.
        if (! self::isValidTripayPhone($customerPhone)) {
            $customerPhone = '';
        }

        if (! TripayClient::isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Metode pembayaran belum dikonfigurasi. Lengkapi pengaturan gateway pembayaran.',
            ], 422);
        }

        $merchantRef = 'DEP-'.(int) $user->id.'-'.now()->format('YmdHis').'-'.Str::upper(Str::random(6));

        $depositId = null;

        try {
            $depositId = DB::transaction(function () use ($user, $amount, $method, $merchantRef) {
                $activePending = Deposit::query()
                    ->where('user_id', (int) $user->id)
                    ->where('status', 'pending')
                    ->where(function (Builder $q) {
                        $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
                    })
                    ->exists();

                if ($activePending) {
                    throw new RuntimeException('Masih ada deposit pending. Selesaikan atau tunggu expired.');
                }

                $deposit = Deposit::query()->create([
                    'user_id' => (int) $user->id,
                    'amount' => $amount,
                    'final_amount' => $amount,
                    'payment_method' => 'tripay',
                    'status' => 'pending',
                    'tripay_merchant_ref' => $merchantRef,
                    'tripay_method' => $method,
                    'expired_at' => now()->addDay(),
                ]);

                return (int) $deposit->id;
            });

            if ($depositId !== null) {
                UserActivity::log(
                    $user,
                    'deposit_create',
                    'Buat deposit',
                    [
                        'deposit_id' => (int) $depositId,
                        'amount' => (int) $amount,
                        'method' => (string) $method,
                        'merchant_ref' => (string) $merchantRef,
                    ]
                );
            }

            $json = TripayClient::createTransaction(
                $merchantRef,
                $amount,
                $method,
                [
                    'name' => (string) ($user->name ?? 'Customer'),
                    'email' => (string) ($user->email ?? ''),
                    'phone' => $customerPhone !== '' ? $customerPhone : '0800000000',
                ],
                [[
                    'sku' => 'DEPOSIT',
                    'name' => 'Deposit Saldo',
                    'price' => $amount,
                    'quantity' => 1,
                ]]
            );

            $data = Arr::get($json, 'data', []);
            $reference = (string) (Arr::get($data, 'reference') ?? '');
            $checkoutUrl = (string) (Arr::get($data, 'checkout_url') ?? '');
            $payCode = Arr::get($data, 'pay_code');
            $providerStatus = (string) (Arr::get($data, 'status') ?? '');
            $expiredTime = Arr::get($data, 'expired_time');

            $finalAmount = $amount;
            $totalAmountRaw = Arr::get($data, 'total_amount');
            if (is_numeric($totalAmountRaw)) {
                $candidate = (int) $totalAmountRaw;
                if ($candidate > 0) {
                    $finalAmount = $candidate;
                }
            } else {
                $feeRaw = Arr::get($data, 'total_fee');
                if (! is_numeric($feeRaw)) {
                    $feeRaw = Arr::get($data, 'fee_customer');
                }
                if (is_numeric($feeRaw)) {
                    $fee = (int) $feeRaw;
                    if ($fee > 0) {
                        $finalAmount = $amount + $fee;
                    }
                }
            }

            DB::transaction(function () use ($depositId, $json, $reference, $checkoutUrl, $payCode, $providerStatus, $expiredTime, $finalAmount) {
                $deposit = Deposit::query()->lockForUpdate()->find($depositId);
                if (! $deposit) {
                    return;
                }

                $deposit->tripay_reference = $reference !== '' ? $reference : $deposit->tripay_reference;
                $deposit->tripay_checkout_url = $checkoutUrl !== '' ? $checkoutUrl : $deposit->tripay_checkout_url;
                $deposit->tripay_pay_code = $payCode !== null ? (string) $payCode : $deposit->tripay_pay_code;
                $deposit->tripay_status = $providerStatus !== '' ? $providerStatus : $deposit->tripay_status;
                $deposit->provider_payload = $json;
                $deposit->final_amount = $finalAmount > 0 ? $finalAmount : $deposit->final_amount;

                if (is_numeric($expiredTime)) {
                    $deposit->expired_at = now()->setTimestamp((int) $expiredTime);
                }

                $deposit->save();
            });

            try {
                $fresh = Deposit::query()->find((int) $depositId);
                if ($fresh) {
                    broadcast(new DepositStatusUpdated($fresh));
                }
            } catch (Throwable) {
                // best-effort
            }

            return response()->json([
                'success' => true,
                'message' => 'Deposit dibuat. Silakan lanjutkan pembayaran.',
                'checkout_url' => $checkoutUrl,
                'reference' => $reference,
                'amount' => $amount,
                'final_amount' => $finalAmount,
            ]);
        } catch (RuntimeException $e) {
            if (is_int($depositId)) {
                try {
                    Deposit::query()
                        ->where('id', $depositId)
                        ->where('status', 'pending')
                        ->update([
                            'status' => 'failed',
                            'processed_at' => now(),
                            'provider_payload' => [
                                'error' => $e->getMessage(),
                            ],
                        ]);
                } catch (Throwable) {
                    // ignore
                }
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            report($e);

            if (is_int($depositId)) {
                try {
                    Deposit::query()
                        ->where('id', $depositId)
                        ->where('status', 'pending')
                        ->update([
                            'status' => 'failed',
                            'processed_at' => now(),
                            'provider_payload' => [
                                'error' => 'Gagal membuat transaksi pembayaran.',
                            ],
                        ]);
                } catch (Throwable) {
                    // ignore
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat deposit.',
            ], 500);
        }
    }

    public function tripayCallback(Request $request): JsonResponse
    {
        $raw = (string) $request->getContent();
        $sig = (string) $request->header('X-Callback-Signature', '');

        try {
            $expected = TripayClient::callbackExpectedSignature($raw);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gateway belum dikonfigurasi.',
            ], 500);
        }

        if (! hash_equals($expected, $sig)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature.',
            ], 401);
        }

        $payload = $request->json()->all();
        if (! is_array($payload)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payload.',
            ], 400);
        }

        $data = Arr::get($payload, 'data', []);
        $merchantRef = (string) (Arr::get($data, 'merchant_ref') ?? Arr::get($payload, 'merchant_ref') ?? '');
        $reference = (string) (Arr::get($data, 'reference') ?? Arr::get($payload, 'reference') ?? '');
        $status = strtoupper((string) (Arr::get($data, 'status') ?? Arr::get($payload, 'status') ?? ''));

        if ($merchantRef === '' && $reference === '') {
            return response()->json([
                'success' => false,
                'message' => 'Missing reference.',
            ], 400);
        }

        $deposit = Deposit::query()
            ->when($reference !== '', fn ($q) => $q->where('tripay_reference', $reference))
            ->when($reference === '' && $merchantRef !== '', fn ($q) => $q->where('tripay_merchant_ref', $merchantRef))
            ->first();

        if (! $deposit) {
            return response()->json([
                'success' => false,
                'message' => 'Deposit not found.',
            ], 404);
        }

        $newStatus = match ($status) {
            'PAID', 'SUCCESS' => 'success',
            'EXPIRED' => 'expired',
            'FAILED' => 'failed',
            default => 'pending',
        };

        $shouldBroadcastStats = false;
        $shouldBroadcastDeposit = false;

        try {
            DB::transaction(function () use ($deposit, $payload, $status, $newStatus, &$shouldBroadcastStats, &$shouldBroadcastDeposit) {
                $row = Deposit::query()->lockForUpdate()->find((int) $deposit->id);
                if (! $row) {
                    return;
                }

                // Always store latest payload for auditing.
                $row->provider_payload = $payload;
                $row->tripay_status = $status !== '' ? $status : $row->tripay_status;

                if (in_array($row->status, ['success', 'failed', 'expired'], true)) {
                    $row->save();
                    $shouldBroadcastDeposit = true;

                    return;
                }

                if ($newStatus !== 'pending') {
                    $row->status = $newStatus;
                    $row->processed_at = now();
                }

                $row->save();
                $shouldBroadcastDeposit = true;

                if ($newStatus === 'success') {
                    $this->creditSuccessfulDeposit($row, 'Deposit sukses', [
                        'deposit_id' => (int) $row->id,
                        'payment_method' => (string) ($row->payment_method ?? ''),
                        'tripay_method' => $row->tripay_method !== null ? (string) $row->tripay_method : null,
                        'tripay_reference' => $row->tripay_reference !== null ? (string) $row->tripay_reference : null,
                        'tripay_merchant_ref' => $row->tripay_merchant_ref !== null ? (string) $row->tripay_merchant_ref : null,
                    ]);

                    $shouldBroadcastStats = true;
                }
            });
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process callback.',
            ], 500);
        }

        if ($shouldBroadcastDeposit) {
            $this->broadcastDepositUpdate((int) $deposit->id);
        }

        if ($shouldBroadcastStats) {
            $this->broadcastUserStats((int) $deposit->user_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'OK',
        ]);
    }

    public function midtransCallback(Request $request): JsonResponse
    {
        $payload = $request->json()->all();
        if (! is_array($payload)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payload.',
            ], 400);
        }

        $orderId = trim((string) (Arr::get($payload, 'order_id') ?? ''));
        $statusCode = trim((string) (Arr::get($payload, 'status_code') ?? ''));
        $grossAmount = trim((string) (Arr::get($payload, 'gross_amount') ?? ''));
        $signature = trim((string) (Arr::get($payload, 'signature_key') ?? ''));

        if ($orderId === '' || $statusCode === '' || $grossAmount === '' || $signature === '') {
            return response()->json([
                'success' => false,
                'message' => 'Missing callback fields.',
            ], 400);
        }

        try {
            $expected = MidtransClient::notificationExpectedSignature($orderId, $statusCode, $grossAmount);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Midtrans belum dikonfigurasi.',
            ], 500);
        }

        if (! hash_equals($expected, $signature)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature.',
            ], 401);
        }

        if (str_starts_with($orderId, 'payment_notif_test_')) {
            return response()->json([
                'success' => true,
                'message' => 'Midtrans test notification acknowledged.',
            ]);
        }

        $deposit = Deposit::query()
            ->where('payment_method', 'midtrans')
            ->where(function (Builder $query) use ($orderId) {
                $query->where('provider_payload->order_id', $orderId)
                    ->orWhere('provider_payload', 'like', '%'.$orderId.'%');
            })
            ->first();

        if (! $deposit) {
            return response()->json([
                'success' => true,
                'message' => 'Notification acknowledged. Deposit not found.',
            ]);
        }

        $transactionStatus = strtolower((string) (Arr::get($payload, 'transaction_status') ?? ''));
        $paymentType = strtolower((string) (Arr::get($payload, 'payment_type') ?? ''));
        $fraudStatus = strtolower((string) (Arr::get($payload, 'fraud_status') ?? ''));
        $transactionId = trim((string) (Arr::get($payload, 'transaction_id') ?? ''));
        $newStatus = self::mapMidtransStatus($transactionStatus, $fraudStatus);

        $shouldBroadcastStats = false;
        $shouldBroadcastDeposit = false;

        try {
            DB::transaction(function () use ($deposit, $payload, $orderId, $transactionId, $paymentType, $transactionStatus, $fraudStatus, $newStatus, &$shouldBroadcastStats, &$shouldBroadcastDeposit) {
                $row = Deposit::query()->lockForUpdate()->find((int) $deposit->id);
                if (! $row) {
                    return;
                }

                $providerPayload = is_array($row->provider_payload) ? $row->provider_payload : [];
                $providerPayload['provider'] = 'midtrans';
                $providerPayload['order_id'] = $orderId;
                $providerPayload['transaction_id'] = $transactionId !== '' ? $transactionId : ($providerPayload['transaction_id'] ?? null);
                $providerPayload['payment_type'] = $paymentType !== '' ? $paymentType : ($providerPayload['payment_type'] ?? null);
                $providerPayload['transaction_status'] = $transactionStatus !== '' ? $transactionStatus : ($providerPayload['transaction_status'] ?? null);
                $providerPayload['fraud_status'] = $fraudStatus !== '' ? $fraudStatus : ($providerPayload['fraud_status'] ?? null);
                $providerPayload['last_notification'] = $payload;
                $row->provider_payload = $providerPayload;

                if (in_array($row->status, ['success', 'failed', 'expired'], true)) {
                    $row->save();
                    $shouldBroadcastDeposit = true;

                    return;
                }

                if ($newStatus !== 'pending') {
                    $row->status = $newStatus;
                    $row->processed_at = now();
                }

                $row->save();
                $shouldBroadcastDeposit = true;

                if ($newStatus === 'success') {
                    $this->creditSuccessfulDeposit($row, 'Deposit sukses', [
                        'deposit_id' => (int) $row->id,
                        'payment_method' => (string) ($row->payment_method ?? ''),
                        'payment_type' => $paymentType !== '' ? $paymentType : null,
                        'provider_reference' => $orderId,
                        'provider_transaction_id' => $transactionId !== '' ? $transactionId : null,
                    ]);

                    $shouldBroadcastStats = true;
                }
            });
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process callback.',
            ], 500);
        }

        if ($shouldBroadcastDeposit) {
            $this->broadcastDepositUpdate((int) $deposit->id);
        }

        if ($shouldBroadcastStats) {
            $this->broadcastUserStats((int) $deposit->user_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'OK',
        ]);
    }
}
