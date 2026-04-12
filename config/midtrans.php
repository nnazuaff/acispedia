<?php

return [
    'enabled' => filter_var(env('MIDTRANS_ENABLED', false), FILTER_VALIDATE_BOOL),

    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    'env' => env('MIDTRANS_ENV', 'sandbox'), // sandbox|production
    'admin_fee' => (int) env('MIDTRANS_ADMIN_FEE', 4000),
    'timeout' => (int) env('MIDTRANS_TIMEOUT', 30),

    'finish_url' => env('MIDTRANS_FINISH_URL', ''),
    'unfinish_url' => env('MIDTRANS_UNFINISH_URL', ''),
    'error_url' => env('MIDTRANS_ERROR_URL', ''),
];