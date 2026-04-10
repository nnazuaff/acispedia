<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Admin Domain
    |--------------------------------------------------------------------------
    |
    | The hostname that serves the admin area, e.g. "admin.acispedia.com".
    | In local development you can set it to "admin.localhost".
    |
    */
    'domain' => env('ADMIN_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Admin Emails
    |--------------------------------------------------------------------------
    |
    | Comma-separated list of emails that are allowed to access the admin area.
    | Example: ADMIN_EMAILS="admin@acispedia.com,owner@acispedia.com"
    |
    */
    'emails' => array_values(array_filter(array_map(
        static fn ($v) => trim((string) $v),
        explode(',', (string) env('ADMIN_EMAILS', '')),
    ))),
];
