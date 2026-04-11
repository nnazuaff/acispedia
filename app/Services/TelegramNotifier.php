<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

final class TelegramNotifier
{
    public static function isConfigured(): bool
    {
        if (! (bool) config('telegram.enabled')) {
            return false;
        }

        return trim((string) config('telegram.bot_token')) !== ''
            && config('telegram.chat_id') !== null
            && trim((string) config('telegram.chat_id')) !== '';
    }

    /**
     * Best-effort send; returns true if Telegram accepts.
     */
    public static function sendMessage(string $text): bool
    {
        if (! self::isConfigured()) {
            return false;
        }

        $token = (string) config('telegram.bot_token');
        $chatId = (string) config('telegram.chat_id');
        $timeout = (int) config('telegram.timeout', 10);
        if ($timeout < 1) {
            $timeout = 10;
        }

        try {
            $resp = Http::asForm()
                ->timeout($timeout)
                ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => $text,
                    'disable_web_page_preview' => true,
                ]);

            if (! $resp->successful()) {
                return false;
            }

            $json = $resp->json();
            return is_array($json) && ($json['ok'] ?? false) === true;
        } catch (Throwable) {
            return false;
        }
    }
}
