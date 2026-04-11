<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FinancialReport;
use App\Models\UserBalance;
use App\Services\MedanpediaClient;
use App\Support\AdminActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FinancialReportController extends Controller
{
    private function sanitizeAmount(mixed $raw): int
    {
        if (is_numeric($raw)) {
            $value = (float) $raw;
        } else {
            $clean = preg_replace('/[^0-9\-]/', '', (string) $raw);
            $value = (float) ($clean !== '' ? $clean : 0);
        }

        if ($value < 0) {
            $value = 0;
        }

        return (int) round($value, 0);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, int>
     */
    private function sanitizeRecord(array $data): array
    {
        $keys = [
            'vendor_medanpedia',
            'vendor_serpul_h2h',
            'vendor_serpul_manual',
            'vendor_serpul_voucher',
            'vendor_pt_yus',
            'vendor_digiflazz',
            'vendor_acispay',
            'bank_bri',
            'bank_bni',
            'bank_bca',
            'wallet_ovo',
            'wallet_dana',
            'wallet_gojek',
            'wallet_other',
            'cash_on_hand',
            'total_receivables',
        ];

        $result = [];
        foreach ($keys as $k) {
            $result[$k] = $this->sanitizeAmount($data[$k] ?? 0);
        }

        return $result;
    }

    /** @param array<string, int> $record */
    private function totalFinancial(array $record): int
    {
        $sum = 0;
        foreach ($record as $value) {
            $sum += (int) $value;
        }
        return $sum;
    }

    public function index(Request $request, MedanpediaClient $medanpedia): Response
    {
        $today = now()->toDateString();
        $dateFrom = trim((string) $request->query('date_from', $today));
        $dateTo = trim((string) $request->query('date_to', $today));
        $editId = (int) $request->query('id', 0);

        try {
            $rangeStart = Carbon::parse($dateFrom)->startOfDay();
        } catch (Throwable) {
            $rangeStart = now()->startOfDay();
        }

        try {
            $rangeEnd = Carbon::parse($dateTo)->endOfDay();
        } catch (Throwable) {
            $rangeEnd = now()->endOfDay();
        }

        $records = FinancialReport::query()
            ->whereBetween('report_date', [$rangeStart->toDateString(), $rangeEnd->toDateString()])
            ->orderByDesc('report_date')
            ->orderByDesc('id')
            ->get();

        $editing = null;
        if ($editId > 0) {
            $editing = $records->firstWhere('id', $editId) ?? FinancialReport::query()->find($editId);
        }

        $customerBalance = (int) UserBalance::query()->sum('balance');

        $medanpediaConfigured = $medanpedia->isConfigured();
        $medanpediaBalance = null;
        if ($medanpediaConfigured) {
            try {
                $profile = $medanpedia->getProfile();
                $balanceRaw = data_get($profile, 'data.balance');
                if (is_numeric($balanceRaw)) {
                    $medanpediaBalance = (int) round((float) $balanceRaw, 0);
                }
            } catch (Throwable) {
                $medanpediaBalance = null;
            }
        }

        return Inertia::render('admin/financial-report', [
            'filters' => [
                'date_from' => $rangeStart->toDateString(),
                'date_to' => $rangeEnd->toDateString(),
                'id' => $editing?->id,
            ],
            'customer_balance' => $customerBalance,
            'provider' => [
                'medanpedia' => [
                    'configured' => $medanpediaConfigured,
                    'balance' => $medanpediaBalance,
                ],
            ],
            'records' => $records->map(fn (FinancialReport $r) => [
                'id' => (int) $r->id,
                'report_date' => $r->report_date?->format('Y-m-d'),
                'vendor_medanpedia' => (int) $r->vendor_medanpedia,
                'bank_bri' => (int) $r->bank_bri,
                'bank_bni' => (int) $r->bank_bni,
                'bank_bca' => (int) $r->bank_bca,
                'wallet_ovo' => (int) $r->wallet_ovo,
                'wallet_dana' => (int) $r->wallet_dana,
                'wallet_gojek' => (int) $r->wallet_gojek,
                'wallet_other' => (int) $r->wallet_other,
                'cash_on_hand' => (int) $r->cash_on_hand,
                'total_receivables' => (int) $r->total_receivables,
                'total_financial' => (int) $r->total_financial,
                'customer_balance' => (int) $r->customer_balance,
                'difference_amount' => (int) $r->difference_amount,
                'updated_by' => $r->updated_by,
                'created_at_wib' => $r->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
            ])->all(),
            'editing' => $editing ? [
                'id' => (int) $editing->id,
                'report_date' => $editing->report_date?->format('Y-m-d') ?? $today,
                'vendor_medanpedia' => (int) $editing->vendor_medanpedia,
                'bank_bri' => (int) $editing->bank_bri,
                'bank_bni' => (int) $editing->bank_bni,
                'bank_bca' => (int) $editing->bank_bca,
                'wallet_ovo' => (int) $editing->wallet_ovo,
                'wallet_dana' => (int) $editing->wallet_dana,
                'wallet_gojek' => (int) $editing->wallet_gojek,
                'wallet_other' => (int) $editing->wallet_other,
                'cash_on_hand' => (int) $editing->cash_on_hand,
                'total_receivables' => (int) $editing->total_receivables,
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'report_date' => ['required', 'date'],
            'vendor_medanpedia' => ['nullable'],
            'bank_bri' => ['nullable'],
            'bank_bni' => ['nullable'],
            'bank_bca' => ['nullable'],
            'wallet_ovo' => ['nullable'],
            'wallet_dana' => ['nullable'],
            'wallet_gojek' => ['nullable'],
            'wallet_other' => ['nullable'],
            'cash_on_hand' => ['nullable'],
            'total_receivables' => ['nullable'],
        ]);

        $record = $this->sanitizeRecord($validated);
        $customerBalance = (int) UserBalance::query()->sum('balance');
        $totalFinancial = $this->totalFinancial($record);
        $difference = $totalFinancial - max(0, $customerBalance);

        $row = FinancialReport::query()->create([
            'report_date' => Carbon::parse((string) $validated['report_date'])->toDateString(),
            ...$record,
            'total_financial' => $totalFinancial,
            'customer_balance' => max(0, $customerBalance),
            'difference_amount' => $difference,
            'updated_by' => $request->user()?->email,
        ]);

        AdminActivity::log($request, 'financial_report_create', 'financial_report', (string) $row->id, 'Create financial report', [
            'report_date' => $row->report_date?->format('Y-m-d'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laporan keuangan berhasil ditambahkan.']);
        return back()->with('success', 'Laporan keuangan berhasil ditambahkan.');
    }

    public function update(Request $request, FinancialReport $financialReport): RedirectResponse
    {
        $validated = $request->validate([
            'report_date' => ['required', 'date'],
            'vendor_medanpedia' => ['nullable'],
            'bank_bri' => ['nullable'],
            'bank_bni' => ['nullable'],
            'bank_bca' => ['nullable'],
            'wallet_ovo' => ['nullable'],
            'wallet_dana' => ['nullable'],
            'wallet_gojek' => ['nullable'],
            'wallet_other' => ['nullable'],
            'cash_on_hand' => ['nullable'],
            'total_receivables' => ['nullable'],
        ]);

        $before = [
            'report_date' => $financialReport->report_date?->format('Y-m-d'),
            'vendor_medanpedia' => (int) $financialReport->vendor_medanpedia,
            'bank_bri' => (int) $financialReport->bank_bri,
            'bank_bni' => (int) $financialReport->bank_bni,
            'bank_bca' => (int) $financialReport->bank_bca,
            'wallet_ovo' => (int) $financialReport->wallet_ovo,
            'wallet_dana' => (int) $financialReport->wallet_dana,
            'wallet_gojek' => (int) $financialReport->wallet_gojek,
            'wallet_other' => (int) $financialReport->wallet_other,
            'cash_on_hand' => (int) $financialReport->cash_on_hand,
            'total_receivables' => (int) $financialReport->total_receivables,
        ];

        $record = $this->sanitizeRecord($validated);
        $customerBalance = (int) UserBalance::query()->sum('balance');
        $totalFinancial = $this->totalFinancial($record);
        $difference = $totalFinancial - max(0, $customerBalance);

        $financialReport->fill([
            'report_date' => Carbon::parse((string) $validated['report_date'])->toDateString(),
            ...$record,
            'total_financial' => $totalFinancial,
            'customer_balance' => max(0, $customerBalance),
            'difference_amount' => $difference,
            'updated_by' => $request->user()?->email,
        ]);
        $financialReport->save();

        AdminActivity::log($request, 'financial_report_update', 'financial_report', (string) $financialReport->id, 'Update financial report', [
            'before' => $before,
            'after' => [
                'report_date' => $financialReport->report_date?->format('Y-m-d'),
                ...$record,
            ],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laporan keuangan berhasil diperbarui.']);
        return back()->with('success', 'Laporan keuangan berhasil diperbarui.');
    }

    public function destroy(Request $request, FinancialReport $financialReport): RedirectResponse
    {
        $id = (int) $financialReport->id;
        $date = $financialReport->report_date?->format('Y-m-d');

        $financialReport->delete();

        AdminActivity::log($request, 'financial_report_delete', 'financial_report', (string) $id, 'Delete financial report', [
            'report_date' => $date,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laporan keuangan dihapus.']);
        return back()->with('success', 'Laporan keuangan dihapus.');
    }
}
