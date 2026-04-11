<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|string|null $report_date
 * @property int|null $vendor_medanpedia
 * @property int|null $vendor_serpul_h2h
 * @property int|null $vendor_serpul_manual
 * @property int|null $vendor_serpul_voucher
 * @property int|null $vendor_pt_yus
 * @property int|null $vendor_digiflazz
 * @property int|null $vendor_acispay
 * @property int|null $bank_bri
 * @property int|null $bank_bni
 * @property int|null $bank_bca
 * @property int|null $wallet_ovo
 * @property int|null $wallet_dana
 * @property int|null $wallet_gojek
 * @property int|null $wallet_other
 * @property int|null $cash_on_hand
 * @property int|null $total_receivables
 * @property int|null $total_financial
 * @property int|null $customer_balance
 * @property int|null $difference_amount
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class FinancialReport extends Model
{
    protected $table = 'financial_reports';

    protected $fillable = [
        'report_date',
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
        'total_financial',
        'customer_balance',
        'difference_amount',
        'updated_by',
    ];

    protected $casts = [
        'report_date' => 'date:Y-m-d',
        'vendor_medanpedia' => 'int',
        'vendor_serpul_h2h' => 'int',
        'vendor_serpul_manual' => 'int',
        'vendor_serpul_voucher' => 'int',
        'vendor_pt_yus' => 'int',
        'vendor_digiflazz' => 'int',
        'vendor_acispay' => 'int',
        'bank_bri' => 'int',
        'bank_bni' => 'int',
        'bank_bca' => 'int',
        'wallet_ovo' => 'int',
        'wallet_dana' => 'int',
        'wallet_gojek' => 'int',
        'wallet_other' => 'int',
        'cash_on_hand' => 'int',
        'total_receivables' => 'int',
        'total_financial' => 'int',
        'customer_balance' => 'int',
        'difference_amount' => 'int',
    ];
}
