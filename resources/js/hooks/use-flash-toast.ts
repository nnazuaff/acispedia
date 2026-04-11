import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

function getInitialInertiaFlashToast(): FlashToast | undefined {
    try {
        const el = document.querySelector('[data-page]') as HTMLElement | null;
        const raw = el?.getAttribute('data-page');
        if (!raw) return undefined;
        const page = JSON.parse(raw);
        return page?.props?.flash?.toast as FlashToast | undefined;
    } catch {
        return undefined;
    }
}

export function useFlashToast(): void {
    const lastShownRef = useRef<string | null>(null);

    useEffect(() => {
        const show = (data: FlashToast | undefined) => {
            if (!data) {
                return;
            }

            const signature = `${data.type}:${data.message}`;
            if (signature === lastShownRef.current) {
                return;
            }

            lastShownRef.current = signature;
            toast[data.type](data.message);
        };

        show(getInitialInertiaFlashToast());

        return router.on('success', (event) => {
            const page = (event as any)?.detail?.page;
            const data = page?.props?.flash?.toast as FlashToast | undefined;
            show(data);
        });
    }, []);
}
