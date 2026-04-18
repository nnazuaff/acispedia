<?php

namespace App\Models;

use App\Services\MailketingClient;
use App\Support\EmailTemplate;
use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Throwable;

/**
 * @property int $id
 * @property string|null $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $account_status
 * @property Carbon|null $email_verified_at
 * @property Carbon|null $last_login_at
 * @property Carbon|null $last_activity_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read UserBalance|null $balanceRow
 * @property-read float $balance
 */
#[Fillable(['name', 'email', 'phone', 'password', 'account_status'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, MustVerifyEmailTrait, Notifiable, TwoFactorAuthenticatable;

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
            'last_login_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function sendEmailVerificationNotification(): void
    {
        if ($this->hasVerifiedEmail()) {
            return;
        }

        $mailketingToken = (string) config('services.mailketing.api_token');

        if ($mailketingToken === '') {
            $this->notify(new VerifyEmail);

            return;
        }

        $key = 'mail:verify:'.$this->getKey();

        // Cooldown: allow 1 send per 60 seconds.
        if (RateLimiter::tooManyAttempts($key, 1)) {
            return;
        }

        RateLimiter::hit($key, 60);

        $verificationUrl = URL::temporarySignedRoute(
            'verify.email.link',
            now()->addMinutes(60),
            [
                'id' => $this->getKey(),
                'hash' => sha1($this->getEmailForVerification()),
            ]
        );

        $subject = 'Verifikasi Email';
        $content = EmailTemplate::render(
            title: 'Verifikasi Email',
            name: (string) $this->name,
            preheader: 'Klik tombol untuk verifikasi email. Link berlaku 60 menit.',
            introLines: [
                'Terima kasih sudah mendaftar di AcisPedia.',
                'Silakan klik tombol di bawah untuk memverifikasi email Anda dan mengaktifkan akun.',
            ],
            actionText: 'Verifikasi Email',
            actionUrl: $verificationUrl,
            outroLines: [
                'Link verifikasi ini akan kedaluwarsa dalam 60 menit.',
            ],
        );

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

        $mailketingToken = (string) config('services.mailketing.api_token');

        if ($mailketingToken === '') {
            $this->notify(new ResetPassword((string) $token));

            return;
        }

        $key = 'mail:reset:'.$this->getKey();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            return;
        }

        RateLimiter::hit($key, 600);

        $linkKey = null;

        for ($i = 0; $i < 5; $i++) {
            $candidate = Str::random(40);
            if (! Cache::has('password_reset_link:'.$candidate)) {
                $linkKey = $candidate;
                break;
            }
        }

        if (! $linkKey) {
            return;
        }

        Cache::put(
            'password_reset_link:'.$linkKey,
            ['email' => $email, 'token' => (string) $token],
            now()->addMinutes(60),
        );

        $resetUrl = URL::to(route('password.reset.link', ['key' => $linkKey], false));

        $subject = 'Reset Password';
        $content = EmailTemplate::render(
            title: 'Reset Password',
            name: (string) $this->name,
            preheader: 'Klik tombol untuk mengatur ulang password. Link berlaku 60 menit.',
            introLines: [
                'Kami menerima permintaan untuk mengatur ulang password akun Anda.',
                'Klik tombol di bawah untuk membuat password baru.',
            ],
            actionText: 'Reset Password',
            actionUrl: $resetUrl,
            outroLines: [
                'Link reset password ini akan kedaluwarsa dalam 60 menit.',
            ],
        );

        MailketingClient::sendEmail(
            recipient: $email,
            subject: $subject,
            content: $content,
        );
    }
}
