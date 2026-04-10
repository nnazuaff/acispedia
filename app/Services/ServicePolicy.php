<?php

namespace App\Services;

final class ServicePolicy
{
    /**
     * @param  array<string, mixed>  $service
     */
    public static function isDisallowed(array $service): bool
    {
        $name = self::firstNonEmptyScalar($service, ['name', 'service_name', 'title']);
        $category = self::firstNonEmptyScalar($service, ['category', 'cat']);
        $description = self::firstNonEmptyScalar($service, ['description', 'desc', 'note']);

        $haystack = trim($name.' '.$category.' '.$description);
        if ($haystack === '') {
            return false;
        }

        $patterns = config('service_policy.patterns', []);
        if (! is_array($patterns) || $patterns === []) {
            return false;
        }

        foreach ($patterns as $pattern) {
            if (! is_string($pattern) || trim($pattern) === '') {
                continue;
            }

            if (@preg_match($pattern, $haystack) === 1) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $service
     * @param  array<int, string>  $keys
     */
    private static function firstNonEmptyScalar(array $service, array $keys): string
    {
        foreach ($keys as $k) {
            if (! array_key_exists($k, $service)) {
                continue;
            }

            $v = $service[$k];

            if (is_scalar($v) && trim((string) $v) !== '') {
                return (string) $v;
            }
        }

        return '';
    }
}
