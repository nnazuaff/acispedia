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

type ConfirmState = {
    open: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
};

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<ConfirmState>({
        open: false,
        options: {},
    });

    const close = React.useCallback((value: boolean) => {
        setState((current) => {
            current.resolve?.(value);
            return { open: false, options: {}, resolve: undefined };
        });
    }, []);

    const confirm = React.useCallback<ConfirmFn>(
        (options) =>
            new Promise<boolean>((resolve) => {
                setState({ open: true, options, resolve });
            }),
        [],
    );

    const title = state.options.title ?? 'Konfirmasi';
    const cancelText = state.options.cancelText ?? 'Batal';
    const confirmText = state.options.confirmText ?? 'Ya, lanjut';
    const variant = state.options.variant ?? 'default';

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Dialog
                open={state.open}
                onOpenChange={(open) => {
                    if (!open) close(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {state.options.description ? (
                            <DialogDescription>
                                {state.options.description}
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
