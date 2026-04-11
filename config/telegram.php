<?php

return [
    'enabled' => (bool) env('TELEGRAM_ENABLED', false),

    // Keep secrets in .env; never hardcode.
    'bot_token' => (string) env('TELEGRAM_BOT_TOKEN', ''),

    // Chat ID can be a user ID or group/channel chat id.
    'chat_id' => env('TELEGRAM_CHAT_ID', null),

    'timeout' => (int) env('TELEGRAM_TIMEOUT', 10),
];
