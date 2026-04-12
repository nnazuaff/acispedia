type SnapResult = Record<string, unknown>;

type MidtransSnapWindow = Window & {
    snap?: {
        pay: (
            token: string,
            options?: {
                onSuccess?: (result: SnapResult) => void;
                onPending?: (result: SnapResult) => void;
                onError?: (result: SnapResult) => void;
                onClose?: () => void;
            }
        ) => void;
    };
};

type EnsureMidtransSnapOptions = {
    snapJsUrl: string;
    clientKey: string;
};

type OpenMidtransSnapPopupOptions = EnsureMidtransSnapOptions & {
    snapToken: string;
    onSuccess?: (result: SnapResult) => void;
    onPending?: (result: SnapResult) => void;
    onError?: (result: SnapResult) => void;
    onClose?: () => void;
};

let midtransScriptPromise: Promise<void> | null = null;

export function canUseMidtransSnap(options: Partial<EnsureMidtransSnapOptions> & { snapToken?: string | null }): boolean {
    return Boolean(options.snapJsUrl && options.clientKey && options.snapToken);
}

export async function ensureMidtransSnap({ snapJsUrl, clientKey }: EnsureMidtransSnapOptions): Promise<void> {
    if (!snapJsUrl || !clientKey) {
        throw new Error('Konfigurasi pembayaran belum lengkap.');
    }

    const existingReady = (window as MidtransSnapWindow).snap;
    if (existingReady) {
        return;
    }

    if (midtransScriptPromise) {
        return midtransScriptPromise;
    }

    midtransScriptPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-midtrans-snap="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Gagal memuat modul pembayaran.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = snapJsUrl;
        script.async = true;
        script.dataset.clientKey = clientKey;
        script.dataset.midtransSnap = 'true';
        script.setAttribute('data-client-key', clientKey);
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => reject(new Error('Gagal memuat modul pembayaran.')), { once: true });
        document.body.appendChild(script);
    }).catch((error) => {
        midtransScriptPromise = null;
        throw error;
    });

    return midtransScriptPromise;
}

export async function openMidtransSnapPopup({
    snapJsUrl,
    clientKey,
    snapToken,
    onSuccess,
    onPending,
    onError,
    onClose,
}: OpenMidtransSnapPopupOptions): Promise<void> {
    await ensureMidtransSnap({ snapJsUrl, clientKey });

    const snap = (window as MidtransSnapWindow).snap;
    if (!snap) {
        throw new Error('Modul pembayaran belum siap.');
    }

    snap.pay(snapToken, {
        onSuccess,
        onPending,
        onError,
        onClose,
    });
}