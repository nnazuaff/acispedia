<?php

namespace App\Support;

class PhoneNormalizer
{
    public static function digitsOnly(?string $raw): string
    {
        $raw = (string) ($raw ?? '');
        $raw = trim($raw);

        if ($raw === '') {
            return '';
        }

        // Keep digits only (removes +, spaces, dashes, dots, etc.).
        $digits = preg_replace('/\D+/', '', $raw) ?? '';

        return trim($digits);
    }
}
