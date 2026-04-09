<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deposit extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'amount',
        'final_amount',
        'payment_method',
        'status',
        'tripay_merchant_ref',
        'tripay_reference',
        'tripay_method',
        'tripay_pay_code',
        'tripay_checkout_url',
        'tripay_status',
        'expired_at',
        'processed_at',
        'provider_payload',
    ];

    /**
     * @return BelongsTo<User, Deposit>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'amount' => 'integer',
            'final_amount' => 'integer',
            'expired_at' => 'datetime',
            'processed_at' => 'datetime',
            'provider_payload' => 'array',
        ];
    }
}
