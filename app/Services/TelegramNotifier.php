<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

final class TelegramNotifier
{
    /**
     * @return list<string>
     */
    private static function chatIds(): array
    {
        $raw = config('telegram.chat_id');

        if (is_array($raw)) {
            $items = $raw;
        } else {
            $items = explode(',', (string) ($raw ?? ''));
        }

        $out = [];
        foreach ($items as $item) {
            $id = trim((string) $item);
            if ($id !== '') {
                $out[] = $id;
            }
        }

        return $out;
    }

    public static function isConfigured(): bool
    {
        if (! (bool) config('telegram.enabled')) {
            return false;
        }

        return trim((string) config('telegram.bot_token')) !== ''
            && count(self::chatIds()) > 0;
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
        $chatIds = self::chatIds();
        $timeout = (int) config('telegram.timeout', 10);
        if ($timeout < 1) {
            $timeout = 10;
        }

        try {
            $anySuccess = false;

            foreach ($chatIds as $chatId) {
                $resp = Http::asForm()
                    ->timeout($timeout)
                    ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                        'chat_id' => $chatId,
                        'text' => $text,
                        'disable_web_page_preview' => true,
                    ]);

                if (! $resp->successful()) {
                    continue;
                }

                $json = $resp->json();
                if (is_array($json) && ($json['ok'] ?? false) === true) {
                    $anySuccess = true;
                }
            }

            return $anySuccess;
        } catch (Throwable) {
            return false;
        }
    }
}
