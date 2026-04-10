<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class OtpService
{
    private const CODE_TTL_SECONDS = 300; // 5 minutes

    private const SEND_LIMIT = 3;

    private const SEND_LIMIT_WINDOW_SECONDS = 600; // 10 minutes

    public static function send(string $purpose, string $email): bool
    {
        $email = Str::lower(trim($email));

        if ($email === '') {
            return false;
        }

        $ip = (string) request()->ip();
        $sendThrottleKey = 'otp:send:'.$purpose.':'.sha1($email.'|'.$ip);

        if (RateLimiter::tooManyAttempts($sendThrottleKey, self::SEND_LIMIT)) {
            return false;
        }

        RateLimiter::hit($sendThrottleKey, self::SEND_LIMIT_WINDOW_SECONDS);

        $code = (string) random_int(100000, 999999);

        Cache::put(self::cacheKey($purpose, $email), self::hashCode($code), self::CODE_TTL_SECONDS);

        $subject = match ($purpose) {
            'login' => 'Kode OTP Login',
            'register' => 'Kode OTP Pendaftaran',
            'reset_password' => 'Kode OTP Reset Password',
            default => 'Kode OTP',
        };

        $content = "<p>Kode OTP Anda:</p><h2 style=\"letter-spacing:2px\">{$code}</h2><p>Berlaku selama 5 menit.</p>";

        $result = MailketingClient::sendEmail(
            recipient: $email,
            subject: $subject,
            content: $content,
        );

        return (($result['status'] ?? null) === 'success');
    }

    public static function verify(string $purpose, string $email, string $code): bool
    {
        $email = Str::lower(trim($email));
        $code = trim($code);

        if ($email === '' || $code === '') {
            return false;
        }

        $key = self::cacheKey($purpose, $email);
        $expected = Cache::get($key);

        if (! is_string($expected) || $expected === '') {
            return false;
        }

        $ok = hash_equals($expected, self::hashCode($code));

        if ($ok) {
            Cache::forget($key);
        }

        return $ok;
    }

    private static function cacheKey(string $purpose, string $email): string
    {
        return 'otp:code:'.$purpose.':'.sha1($email);
    }

    private static function hashCode(string $code): string
    {
        $pepper = (string) config('app.key');

        return hash('sha256', $code.'|'.$pepper);
    }
}
