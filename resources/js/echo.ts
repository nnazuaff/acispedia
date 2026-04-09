import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher?: unknown;
        Echo?: any;
    }
}

function getCsrfToken(): string | null {
    const el = document.querySelector('meta[name="csrf-token"]');
    const token = el?.getAttribute('content');
    return token || null;
}

export function initEcho(): any | null {
    if (typeof window === 'undefined') return null;

    const key = import.meta.env.VITE_REVERB_APP_KEY as string | undefined;
    if (!key) return null;

    const hostFromEnvRaw = import.meta.env.VITE_REVERB_HOST as string | undefined;
    const hostFromEnv = hostFromEnvRaw?.replace(/^"+|"+$/g, '');
    const host = hostFromEnv && hostFromEnv.trim() !== '' ? hostFromEnv : window.location.hostname;
    const portRaw = (import.meta.env.VITE_REVERB_PORT as string | undefined) ?? '8080';
    const port = Number(portRaw);

    const scheme = (import.meta.env.VITE_REVERB_SCHEME as string | undefined) ?? 'http';
    const forceTLS = scheme === 'https';

    window.Pusher = Pusher;

    const csrf = getCsrfToken();

    const echo = new Echo({
        broadcaster: 'reverb',
        key,
        wsHost: host,
        wsPort: Number.isFinite(port) ? port : 8080,
        wssPort: Number.isFinite(port) ? port : 8080,
        forceTLS,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        ...(csrf
            ? {
                  auth: {
                      headers: {
                          'X-CSRF-TOKEN': csrf,
                      },
                  },
              }
            : {}),
    });

    window.Echo = echo;

    return echo;
}

initEcho();
