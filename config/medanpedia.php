<?php

return [
    'base_url' => env('MEDANPEDIA_BASE_URL', 'https://api.medanpedia.co.id'),

    'api_id' => env('MEDANPEDIA_API_ID'),
    'api_key' => env('MEDANPEDIA_API_KEY'),
    'timeout' => (int) env('MEDANPEDIA_TIMEOUT', 20),

    'force_ipv4' => filter_var(env('MEDANPEDIA_FORCE_IPV4', false), FILTER_VALIDATE_BOOLEAN),
    'auto_ipv4_fallback' => filter_var(env('MEDANPEDIA_AUTO_IPV4_FALLBACK', true), FILTER_VALIDATE_BOOLEAN),

    'services_cache_ttl' => (int) env('MEDANPEDIA_SERVICES_CACHE_TTL', 300),
    'markup_amount' => (int) env('MEDANPEDIA_MARKUP_AMOUNT', 200),
];
