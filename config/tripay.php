<?php

return [
    'api_key' => env('TRIPAY_API_KEY', ''),
    'private_key' => env('TRIPAY_PRIVATE_KEY', ''),
    'merchant_code' => env('TRIPAY_MERCHANT_CODE', ''),

    'env' => env('TRIPAY_ENV', 'sandbox'), // sandbox|production
    'default_method' => env('TRIPAY_DEFAULT_METHOD', 'QRIS2'),

    // Optional overrides. If empty, app.url will be used.
    'callback_url' => env('TRIPAY_CALLBACK_URL', ''),
    'return_url' => env('TRIPAY_RETURN_URL', ''),

    'timeout' => (int) env('TRIPAY_TIMEOUT', 30),
];
