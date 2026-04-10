<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and reset the user's forgotten password.
     *
     * @param  array<string, string>  $input
     */
    public function reset(User $user, array $input): void
    {
        Validator::make($input, [
            'password' => $this->passwordRules(),
            'otp_code' => ['nullable', 'string'],
        ])->validate();

        $otpCode = trim((string) ($input['otp_code'] ?? ''));

        if ($otpCode === '') {
            if (! OtpService::send('reset_password', $user->email)) {
                throw ValidationException::withMessages([
                    'otp_code' => 'Gagal mengirim OTP. Coba lagi beberapa saat.',
                ]);
            }

            throw ValidationException::withMessages([
                'otp_code' => 'Kode OTP sudah dikirim ke email. Masukkan kode untuk melanjutkan.',
            ]);
        }

        if (! OtpService::verify('reset_password', $user->email, $otpCode)) {
            throw ValidationException::withMessages([
                'otp_code' => 'OTP tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        $user->forceFill([
            'password' => $input['password'],
        ])->save();
    }
}
