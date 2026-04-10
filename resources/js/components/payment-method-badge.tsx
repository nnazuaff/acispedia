import * as React from 'react';
import { Landmark, QrCode } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export type PaymentMethodKind = 'qris' | 'va' | 'other';

export function getPaymentMethodKind(label: string): PaymentMethodKind {
    const normalized = String(label ?? '').trim().toLowerCase();

    if (normalized === 'qris') return 'qris';
    if (normalized === 'virtual account' || normalized === 'va') return 'va';

    return 'other';
}

export function PaymentMethodBadge({
    label,
    variant = 'outline',
    className,
}: {
    label: string;
    variant?: React.ComponentProps<typeof Badge>['variant'];
    className?: string;
}) {
    const kind = getPaymentMethodKind(label);

    const Icon =
        kind === 'qris' ? QrCode : kind === 'va' ? Landmark : null;

    return (
        <Badge variant={variant} className={className}>
            <span className="inline-flex items-center gap-1.5">
                {Icon ? <Icon className="size-3.5" /> : null}
                <span>{label}</span>
            </span>
        </Badge>
    );
}

export function PaymentMethodInline({
    label,
    className,
}: {
    label: string;
    className?: string;
}) {
    const kind = getPaymentMethodKind(label);
    const Icon =
        kind === 'qris' ? QrCode : kind === 'va' ? Landmark : null;

    return (
        <span className={className ?? 'inline-flex items-center gap-1.5'}>
            {Icon ? <Icon className="size-4" /> : null}
            <span>{label}</span>
        </span>
    );
}
