<?php

namespace App\Models;

use App\Services\MailketingClient;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Throwable;

#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, MustVerifyEmailTrait;

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

    public function sendEmailVerificationNotification(): void
    {
        if ($this->hasVerifiedEmail()) {
            return;
        }

        $key = 'mail:verify:'.$this->getKey();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            return;
        }

        RateLimiter::hit($key, 600);

        $verificationUrl = URL::temporarySignedRoute(
            'verify.email.link',
            now()->addMinutes(60),
            [
                'id' => $this->getKey(),
                'hash' => sha1($this->getEmailForVerification()),
            ]
        );

        $subject = 'Verifikasi Email';
        $content = '<p>Silakan klik link berikut untuk verifikasi email:</p>'
            .'<p><a href="'.$verificationUrl.'">Verifikasi Email</a></p>'
            .'<p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>';

        MailketingClient::sendEmail(
            recipient: $this->email,
            subject: $subject,
            content: $content,
        );
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $email = Str::lower(trim((string) $this->email));

        if ($email === '') {
            return;
        }

        $key = 'mail:reset:'.$this->getKey();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            return;
        }

        RateLimiter::hit($key, 600);

        $resetUrl = URL::to(route('password.reset', [
            'token' => $token,
            'email' => $email,
        ], false));

        $subject = 'Reset Password';
        $content = '<p>Kami menerima permintaan reset password.</p>'
            .'<p>Klik link berikut untuk membuat password baru:</p>'
            .'<p><a href="'.$resetUrl.'">Buat Password Baru</a></p>'
            .'<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>';

        MailketingClient::sendEmail(
            recipient: $email,
            subject: $subject,
            content: $content,
        );
    }
}
