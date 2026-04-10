<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Schema;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Throwable;

#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * @var array<int, string>
     */
    protected $appends = ['balance'];

    /**
     * @return HasOne<UserBalance>
     */
    public function balanceRow(): HasOne
    {
        return $this->hasOne(UserBalance::class, 'user_id');
    }

    public function getBalanceAttribute(): float
    {
        static $hasUserBalanceTable = null;

        if ($hasUserBalanceTable === null) {
            try {
                $hasUserBalanceTable = Schema::hasTable('user_balance');
            } catch (Throwable) {
                $hasUserBalanceTable = false;
            }
        }

        if (! $hasUserBalanceTable) {
            return 0;
        }

        try {
            return (float) ($this->balanceRow?->balance ?? 0);
        } catch (Throwable) {
            return 0;
        }
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
