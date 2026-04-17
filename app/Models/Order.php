<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $service_id
 * @property string|null $service_name
 * @property int|null $base_price
 * @property int|null $price_per_1000
 * @property int $total_price
 * @property string $target
 * @property string|null $comments
 * @property int $quantity
 * @property string|null $provider_order_id
 * @property string $status
 * @property int|null $start_count
 * @property int|null $remains
 * @property int|null $charge
 * @property \Illuminate\Support\Carbon|null $refunded_at
 * @property \Illuminate\Support\Carbon|null $last_status_check
 * @property int|null $status_check_attempts
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User|null $user
 */
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
        'refunded_at',
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
            'refunded_at' => 'datetime',
            'last_status_check' => 'datetime',
            'status_check_attempts' => 'integer',
        ];
    }
}
