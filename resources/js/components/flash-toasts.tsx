import { usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

type ToastPayload = {
    type?: 'success' | 'error' | 'info' | 'warning';
    message?: string;
};

export default function FlashToasts() {
    const page = usePage();
    const props = page.props as any;

    const isAdminArea = Boolean(props?.isAdminArea);

    const flash = (props?.flash ?? {}) as Record<string, unknown>;
    const alerts = (props?.alerts ?? {}) as { success?: unknown; error?: unknown };

    const toastPayload = (flash?.toast ?? null) as ToastPayload | null;

    const messageFromToast = typeof toastPayload?.message === 'string' ? toastPayload.message.trim() : '';
    const typeFromToast = (toastPayload?.type ?? 'info') as ToastPayload['type'];

    const messageFromSuccess = isAdminArea && typeof alerts?.success === 'string' ? alerts.success.trim() : '';
    const messageFromError = isAdminArea && typeof alerts?.error === 'string' ? alerts.error.trim() : '';

    // Prioritize inertia flash toast; avoid double-toasts when controllers set both toast + session success.
        const finalType: ToastPayload['type'] | null = messageFromToast
        ? typeFromToast
        : messageFromError
          ? 'error'
          : messageFromSuccess
            ? 'success'
            : null;

    const finalMessage = messageFromToast || messageFromError || messageFromSuccess;

    const lastShownRef = React.useRef<string>('');

    React.useEffect(() => {
        if (!finalType || !finalMessage) {
            return;
        }

        const key = `${page.url}|${finalType}|${finalMessage}`;
        if (lastShownRef.current === key) {
            return;
        }
        lastShownRef.current = key;

        if (finalType === 'success') toast.success(finalMessage);
        else if (finalType === 'error') toast.error(finalMessage);
        else if (finalType === 'warning') toast.warning(finalMessage);
        else toast(finalMessage);
    }, [finalType, finalMessage, page.url]);

    return null;
}
