<?php

use App\Support\TargetNormalizer;

it('normalizes instagram followers target from url with tracking query to username', function () {
    $service = [
        'name' => 'Instagram Followers',
        'category' => 'Instagram Followers',
    ];

    $input = 'https://www.instagram.com/ferdyandriansaputra1?igsh=MWVvM2I1ZmczMjE0Yw==';
    $out = TargetNormalizer::normalizeForService($service, $input);

    expect($out['error'])->toBeNull();
    expect($out['target'])->toBe('ferdyandriansaputra1');
});

it('accepts instagram followers target as @username', function () {
    $service = [
        'name' => 'Instagram Followers',
        'category' => 'Instagram Followers',
    ];

    $out = TargetNormalizer::normalizeForService($service, '@ferdyandriansaputra1');

    expect($out['error'])->toBeNull();
    expect($out['target'])->toBe('ferdyandriansaputra1');
});

it('normalizes tiktok short link by removing trailing slash', function () {
    $service = [
        'name' => 'Tiktok',
        'category' => 'Tiktok',
    ];

    $out1 = TargetNormalizer::normalizeForService($service, 'https://vt.tiktok.com/ZSHpHjKmk');
    $out2 = TargetNormalizer::normalizeForService($service, 'https://vt.tiktok.com/ZSHpHjKmk/');

    expect($out1['error'])->toBeNull();
    expect($out2['error'])->toBeNull();
    expect($out1['target'])->toBe('https://vt.tiktok.com/ZSHpHjKmk');
    expect($out2['target'])->toBe('https://vt.tiktok.com/ZSHpHjKmk');
});
