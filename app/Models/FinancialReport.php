<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
