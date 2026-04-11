<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? 'system' }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    @php($faviconV = @filemtime(public_path('favicon.png')) ?: '1')
    <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}?v={{ $faviconV }}">
    <link rel="shortcut icon" href="{{ asset('favicon.png') }}?v={{ $faviconV }}">
    <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}?v={{ $faviconV }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <x-inertia::head>
        @php
            $appName = (string) config('app.name', 'Laravel');
            $appUrl = (string) config('app.url', '');
            $canonical = url()->current();
            $defaultTitle = $appName;
            $defaultDescription = (string) config(
                'seo.description',
                'Panel SMM untuk order layanan sosial media, deposit saldo, dan monitoring status pesanan.',
            );
            $ogImage = (string) config('seo.og_image', '');
            if ($ogImage === '') {
                $ogImage = asset('favicon.png');
            }

            $adminDomain = (string) config('admin.domain', '');
            $shouldNoIndex = $adminDomain !== '' && request()->getHost() === $adminDomain;
        @endphp

        <title>{{ $defaultTitle }}</title>
        <meta name="description" content="{{ $defaultDescription }}">
        <link rel="canonical" href="{{ $canonical }}">

        <meta name="robots" content="{{ $shouldNoIndex ? 'noindex,nofollow' : 'index,follow' }}">

        <meta property="og:locale" content="id_ID">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $appName }}">
        <meta property="og:title" content="{{ $defaultTitle }}">
        <meta property="og:description" content="{{ $defaultDescription }}">
        <meta property="og:url" content="{{ $canonical }}">
        <meta property="og:image" content="{{ $ogImage }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $defaultTitle }}">
        <meta name="twitter:description" content="{{ $defaultDescription }}">
        <meta name="twitter:image" content="{{ $ogImage }}">

        <script type="application/ld+json">
            {!! json_encode([
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'Organization',
                        '@id' => ($appUrl !== '' ? rtrim($appUrl, '/') : url('/')).'#organization',
                        'name' => $appName,
                        'url' => $appUrl !== '' ? rtrim($appUrl, '/') : url('/'),
                        'logo' => [
                            '@type' => 'ImageObject',
                            'url' => $ogImage,
                        ],
                    ],
                    [
                        '@type' => 'WebSite',
                        '@id' => ($appUrl !== '' ? rtrim($appUrl, '/') : url('/')).'#website',
                        'name' => $appName,
                        'url' => $appUrl !== '' ? rtrim($appUrl, '/') : url('/'),
                        'publisher' => [
                            '@id' => ($appUrl !== '' ? rtrim($appUrl, '/') : url('/')).'#organization',
                        ],
                    ],
                ],
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
        </script>
    </x-inertia::head>
</head>

<body class="font-sans antialiased">
    <x-inertia::app />
</body>

</html>
