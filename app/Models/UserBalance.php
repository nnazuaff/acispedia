<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBalance extends Model
{
    protected $table = 'user_balance';

    public $timestamps = true;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'balance',
        'total_spent',
        'total_deposit',
    ];

    /**
     * @return BelongsTo<User, UserBalance>
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
            'balance' => 'float',
            'total_spent' => 'float',
            'total_deposit' => 'float',
        ];
    }
}
