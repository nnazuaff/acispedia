<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Services\TelegramNotifications;
use App\Support\PhoneNormalizer;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Throwable;

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
        $input['phone'] = PhoneNormalizer::digitsOnly($input['phone'] ?? null);

        $validator = Validator::make($input, [
            ...$this->profileRules(),
            'phone' => ['required', 'string', 'max:25', 'regex:/^\d+$/', Rule::unique(User::class, 'phone')],
            'password' => $this->passwordRules(),
            'security_check' => ['required', 'string'],
        ]);

        $validator->after(function ($validator) use ($input) {
            $expected = strtoupper((string) session('security_check_code', ''));
            $provided = strtoupper((string) ($input['security_check'] ?? ''));

            if ($expected === '' || ! hash_equals($expected, $provided)) {
                $validator->errors()->add('security_check', 'Security check tidak sesuai.');
            }
        });

        $validator->validate();

        session()->forget('security_check_code');

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'password' => $input['password'],
        ]);

        try {
            TelegramNotifications::registration($user);
        } catch (Throwable) {
            // best-effort
        }

        return $user;
    }
}
