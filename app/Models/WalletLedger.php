<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $direction
 * @property int $amount
 * @property int|null $balance_before
 * @property int|null $balance_after
 * @property string|null $source_type
 * @property string|null $source_id
 * @property string|null $description
 * @property array|null $meta
 * @property \Illuminate\Support\Carbon|null $event_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User|null $user
 */
class WalletLedger extends Model
{
    protected $table = 'wallet_ledger';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'direction',
        'amount',
        'balance_before',
        'balance_after',
        'source_type',
        'source_id',
        'description',
        'meta',
        'event_at',
    ];

    /**
     * @return BelongsTo<User, WalletLedger>
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
            'balance_before' => 'integer',
            'balance_after' => 'integer',
            'meta' => 'array',
            'event_at' => 'datetime',
        ];
    }
}
