<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'service_id',
        'service_name',
        'base_price',
        'price_per_1000',
        'total_price',
        'target',
        'comments',
        'quantity',
        'provider_order_id',
        'status',
        'start_count',
        'remains',
        'charge',
        'last_status_check',
        'status_check_attempts',
    ];

    /**
     * @return BelongsTo<User, Order>
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
            'service_id' => 'integer',
            'base_price' => 'integer',
            'price_per_1000' => 'integer',
            'total_price' => 'integer',
            'quantity' => 'integer',
            'start_count' => 'integer',
            'remains' => 'integer',
            'charge' => 'integer',
            'last_status_check' => 'datetime',
            'status_check_attempts' => 'integer',
        ];
    }
}
