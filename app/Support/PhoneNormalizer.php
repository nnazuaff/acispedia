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

    /**
     * Normalize Indonesian phone numbers into local format starting with '0'.
     * Examples:
     * - +62812xxxx -> 0812xxxx
     * - 62812xxxx  -> 0812xxxx
     * - 620812xxx  -> 0812xxx
     */
    public static function normalizeIdPhoneToLocalZero(?string $raw): string
    {
        $digits = self::digitsOnly($raw);
        if ($digits === '') {
            return '';
        }

        if (str_starts_with($digits, '62')) {
            $rest = substr($digits, 2);
            $rest = ltrim($rest, '0');

            return '0'.$rest;
        }

        return $digits;
    }
}
