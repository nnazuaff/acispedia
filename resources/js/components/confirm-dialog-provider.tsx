import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type ConfirmOptions = {
    title?: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState<ConfirmOptions>({});
    const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

    const close = React.useCallback((value: boolean) => {
        const resolve = resolveRef.current;
        resolveRef.current = null;
        setOpen(false);
        resolve?.(value);
    }, []);

    const confirm = React.useCallback<ConfirmFn>((nextOptions) => {
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
            setOptions(nextOptions);
            setOpen(true);
        });
    }, []);

    const title = options.title ?? 'Konfirmasi';
    const cancelText = options.cancelText ?? 'Batal';
    const confirmText = options.confirmText ?? 'Ya, lanjut';
    const variant = options.variant ?? 'default';

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen && open) close(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {options.description ? (
                            <DialogDescription>
                                {options.description}
                            </DialogDescription>
                        ) : null}
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => close(false)}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            variant={variant}
                            onClick={() => close(true)}
                        >
                            {confirmText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ConfirmContext.Provider>
    );
}

export function useConfirm(): ConfirmFn {
    const ctx = React.useContext(ConfirmContext);
    if (!ctx) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return ctx;
}
