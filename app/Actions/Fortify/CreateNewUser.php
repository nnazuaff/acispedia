<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $validator = Validator::make($input, [
            ...$this->profileRules(),
            'phone' => ['required', 'string', 'max:25', Rule::unique(User::class, 'phone')],
            'password' => $this->passwordRules(),
            'security_check' => ['required', 'string'],
            'otp_code' => ['nullable', 'string'],
        ]);

        $validator->after(function ($validator) use ($input) {
            $expected = strtoupper((string) session('security_check_code', ''));
            $provided = strtoupper((string) ($input['security_check'] ?? ''));

            if ($expected === '' || ! hash_equals($expected, $provided)) {
                $validator->errors()->add('security_check', 'Security check tidak sesuai.');
            }
        });

        $validator->validate();

        $email = (string) $input['email'];
        $otpCode = trim((string) ($input['otp_code'] ?? ''));

        if ($otpCode === '') {
            if (! OtpService::send('register', $email)) {
                throw ValidationException::withMessages([
                    'otp_code' => 'Gagal mengirim OTP. Coba lagi beberapa saat.',
                ]);
            }

            throw ValidationException::withMessages([
                'otp_code' => 'Kode OTP sudah dikirim ke email. Masukkan kode untuk melanjutkan.',
            ]);
        }

        if (! OtpService::verify('register', $email, $otpCode)) {
            throw ValidationException::withMessages([
                'otp_code' => 'OTP tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        session()->forget('security_check_code');

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => trim($input['phone']),
            'password' => $input['password'],
        ]);
    }
}
