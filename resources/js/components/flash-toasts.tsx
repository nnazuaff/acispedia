import { usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/i18n-provider';

type ToastPayload = {
    type?: 'success' | 'error' | 'info' | 'warning';
    message?: string;
};

export default function FlashToasts() {
    const page = usePage();
    const props = page.props as any;
    const { t, locale } = useI18n();

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

        const translatedMessage = t(finalMessage);

        const key = `${locale}|${page.url}|${finalType}|${translatedMessage}`;
        if (lastShownRef.current === key) {
            return;
        }
        lastShownRef.current = key;

        if (finalType === 'success') toast.success(translatedMessage);
        else if (finalType === 'error') toast.error(translatedMessage);
        else if (finalType === 'warning') toast.warning(translatedMessage);
        else toast(translatedMessage);
    }, [finalType, finalMessage, locale, page.url, t]);

    return null;
}
