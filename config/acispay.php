<?php

return [
    // Base URL of your AcisPay app, e.g. https://acispay.example.com
    'base_url' => env('ACISPAY_BASE_URL', ''),

    // API token to call AcisPay endpoints (Bearer token)
    'api_token' => env('ACISPAY_API_TOKEN', ''),

    // HTTP timeout (seconds)
    'timeout' => (int) env('ACISPAY_TIMEOUT', 15),

    // Endpoint paths (relative to base_url)
    // Expected to return JSON with a balance for the provided account.
    'check_balance_path' => env('ACISPAY_CHECK_BALANCE_PATH', '/api/acispedia/check-balance'),

    // Expected to perform the transfer/debit in AcisPay and return JSON success.
    'transfer_path' => env('ACISPAY_TRANSFER_PATH', '/api/acispedia/transfer'),
];
