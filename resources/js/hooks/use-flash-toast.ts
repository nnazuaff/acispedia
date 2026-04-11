import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    const page = usePage();
    const lastShownRef = useRef<string | null>(null);

    const toastData = (page.props as any)?.flash?.toast as FlashToast | undefined;

    useEffect(() => {
        if (!toastData) {
            return;
        }

        const signature = `${toastData.type}:${toastData.message}`;
        if (signature === lastShownRef.current) {
            return;
        }

        lastShownRef.current = signature;
        toast[toastData.type](toastData.message);
    }, [toastData?.type, toastData?.message]);
}
