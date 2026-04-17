<?php

namespace App\Support;

use Illuminate\Support\Str;

final class TargetNormalizer
{
    /**
     * @param  array<string, mixed>  $service
     * @return array{target: string, error: string|null}
     */
    public static function normalizeForService(array $service, string $rawTarget): array
    {
        $target = trim($rawTarget);

        if ($target === '') {
            return ['target' => '', 'error' => 'Target tidak boleh kosong.'];
        }

        if (self::isInstagramFollowersService($service)) {
            $username = self::extractInstagramUsername($target);

            if ($username === null) {
                return [
                    'target' => $target,
                    'error' => 'Target Instagram tidak valid. Isi username (contoh: ferdyandriansaputra1) atau link profil (contoh: https://www.instagram.com/ferdyandriansaputra1).',
                ];
            }

            return ['target' => $username, 'error' => null];
        }

        if (self::isTikTokFollowersService($service)) {
            $username = self::extractTikTokUsername($target);

            if ($username === null) {
                return [
                    'target' => $target,
                    'error' => 'Target TikTok tidak valid. Isi username (contoh: moyzstore) atau link profil (contoh: https://tiktok.com/@moyzstore).',
                ];
            }

            return ['target' => $username, 'error' => null];
        }

        // Known URLs that frequently fail due to extra trailing slash.
        $target = self::normalizeUrlTrailingSlash($target, [
            'vt.tiktok.com',
            'tiktok.com',
            'www.tiktok.com',
            'm.tiktok.com',
        ]);

        return ['target' => $target, 'error' => null];
    }

    /**
     * @param  array<string, mixed>  $service
     */
    private static function isInstagramFollowersService(array $service): bool
    {
        $name = is_scalar($service['name'] ?? null) ? (string) $service['name'] : '';
        $category = is_scalar($service['category'] ?? null) ? (string) $service['category'] : '';
        $description = is_scalar($service['description'] ?? null) ? (string) $service['description'] : '';

        $text = mb_strtolower(trim($name.' '.$category.' '.$description));
        if ($text === '') {
            return false;
        }

        // Match common naming variations.
        return str_contains($text, 'instagram')
            && (str_contains($text, 'follower') || str_contains($text, 'followers'));
    }

    /**
     * @param  array<string, mixed>  $service
     */
    private static function isTikTokFollowersService(array $service): bool
    {
        $name = is_scalar($service['name'] ?? null) ? (string) $service['name'] : '';
        $category = is_scalar($service['category'] ?? null) ? (string) $service['category'] : '';
        $description = is_scalar($service['description'] ?? null) ? (string) $service['description'] : '';

        $text = mb_strtolower(trim($name.' '.$category.' '.$description));
        if ($text === '') {
            return false;
        }

        return str_contains($text, 'tiktok')
            && (str_contains($text, 'follower') || str_contains($text, 'followers'));
    }

    private static function extractTikTokUsername(string $input): ?string
    {
        $t = trim($input);
        $t = trim($t, " \t\n\r\0\x0B\"'");

        if ($t === '') {
            return null;
        }

        if (str_starts_with($t, '@')) {
            $t = ltrim($t, '@');
        }

        // If it's already a plain username.
        if (! Str::contains($t, ['://', '/', '?', '#'])) {
            return self::isValidTikTokUsername($t) ? $t : null;
        }

        $url = $t;
        if (! preg_match('~^https?://~i', $url)) {
            $url = 'https://'.$url;
        }

        $parts = @parse_url($url);
        if (! is_array($parts)) {
            return null;
        }

        $host = isset($parts['host']) ? mb_strtolower((string) $parts['host']) : '';
        $host = preg_replace('/^www\./i', '', $host) ?? $host;

        if ($host === '' || ! str_ends_with($host, 'tiktok.com')) {
            return null;
        }

        $path = isset($parts['path']) ? (string) $parts['path'] : '';
        $path = trim($path);
        $path = trim($path, '/');

        if ($path === '') {
            return null;
        }

        $segments = array_values(array_filter(explode('/', $path), static fn ($s) => $s !== ''));
        $first = $segments[0] ?? '';
        if ($first === '') {
            return null;
        }

        if (str_starts_with($first, '@')) {
            $first = ltrim($first, '@');
        }

        return self::isValidTikTokUsername($first) ? $first : null;
    }

    private static function isValidTikTokUsername(string $username): bool
    {
        $u = trim($username);
        if ($u === '') {
            return false;
        }

        // TikTok username rules (practical): letters, numbers, underscore, dot. Max 24.
        return preg_match('/^[A-Za-z0-9._]{2,24}$/', $u) === 1;
    }

    private static function extractInstagramUsername(string $input): ?string
    {
        $t = trim($input);
        $t = trim($t, " \t\n\r\0\x0B\"'");

        if ($t === '') {
            return null;
        }

        if (str_starts_with($t, '@')) {
            $t = ltrim($t, '@');
        }

        // If it's already a plain username.
        if (! Str::contains($t, ['://', '/', '?', '#'])) {
            return self::isValidInstagramUsername($t) ? $t : null;
        }

        // Ensure scheme so parse_url works reliably.
        $url = $t;
        if (! preg_match('~^https?://~i', $url)) {
            $url = 'https://'.$url;
        }

        $parts = @parse_url($url);
        if (! is_array($parts)) {
            return null;
        }

        $host = isset($parts['host']) ? mb_strtolower((string) $parts['host']) : '';
        $host = preg_replace('/^www\./i', '', $host) ?? $host;

        if ($host !== 'instagram.com') {
            return null;
        }

        $path = isset($parts['path']) ? (string) $parts['path'] : '';
        $path = trim($path);
        $path = trim($path, '/');

        if ($path === '') {
            return null;
        }

        $segments = array_values(array_filter(explode('/', $path), static fn ($s) => $s !== ''));
        $first = $segments[0] ?? '';

        // Reserved Instagram paths that are not usernames.
        $reserved = ['p', 'reel', 'tv', 'stories', 'explore', 'accounts', 'about', 'developer', 'directory'];
        if ($first === '' || in_array(mb_strtolower($first), $reserved, true)) {
            return null;
        }

        return self::isValidInstagramUsername($first) ? $first : null;
    }

    private static function isValidInstagramUsername(string $username): bool
    {
        $u = trim($username);
        if ($u === '') {
            return false;
        }

        // Instagram username rules: letters, numbers, underscore, dot. Max 30.
        return preg_match('/^[A-Za-z0-9._]{1,30}$/', $u) === 1;
    }

    /**
     * Normalize URLs for known domains that often fail because of a trailing slash.
     *
     * @param  array<int, string>  $hosts
     */
    private static function normalizeUrlTrailingSlash(string $input, array $hosts): string
    {
        $t = trim($input);

        if (! Str::contains($t, ['://', 'vt.tiktok.com', 'tiktok.com'])) {
            return $t;
        }

        $url = $t;
        if (! preg_match('~^https?://~i', $url)) {
            $url = 'https://'.$url;
        }

        $parts = @parse_url($url);
        if (! is_array($parts)) {
            return $t;
        }

        $host = isset($parts['host']) ? mb_strtolower((string) $parts['host']) : '';
        if ($host === '') {
            return $t;
        }

        $hostNoWww = preg_replace('/^www\./i', '', $host) ?? $host;

        $allowed = array_map(static fn ($h) => mb_strtolower(trim($h)), $hosts);
        $allowed = array_values(array_filter($allowed, static fn ($h) => $h !== ''));

        if (! in_array($hostNoWww, $allowed, true) && ! in_array($host, $allowed, true)) {
            return $t;
        }

        $scheme = 'https';
        $path = isset($parts['path']) ? (string) $parts['path'] : '';
        $path = $path === '' ? '/' : $path;

        if ($path !== '/') {
            $path = rtrim($path, '/');
            if ($path === '') {
                $path = '/';
            }
        }

        $rebuilt = $scheme.'://'.$hostNoWww.$path;

        if (isset($parts['query']) && is_string($parts['query']) && $parts['query'] !== '') {
            $rebuilt .= '?'.$parts['query'];
        }

        return $rebuilt;
    }
}
