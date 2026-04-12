import * as React from 'react';
import { ArrowLeftRight, Landmark, QrCode, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export type PaymentMethodKind = 'qris' | 'va' | 'ewallet' | 'topup' | 'conversion' | 'other';
export type PaymentMethodLabelSource = {
    payment_method: string;
    tripay_method: string | null;
    payment_channel?: string | null;
};

export function getPaymentMethodLabel(source: PaymentMethodLabelSource): string {
    const channel = String(source.payment_channel ?? source.tripay_method ?? '').trim();
    const upper = channel.toUpperCase();

    if (upper === 'QRIS2' || upper.startsWith('QRIS')) return 'QRIS';
    if (upper === 'GOPAY') return 'GoPay';
    if (upper === 'SHOPEEPAY') return 'ShopeePay';
    if (['OVO', 'DANA'].includes(upper)) return upper;
    if (upper.endsWith('VA') || upper.endsWith('_TRANSFER') || upper.includes('TRANSFER')) return 'VA Bank';
    if (channel) return channel;

    const payment = String(source.payment_method ?? '').trim().toLowerCase();
    if (payment === 'konversi_saldo') return 'Konversi Saldo';
    if (payment === 'midtrans') return 'Isi Saldo';
    if (payment === 'tripay') return 'Pembayaran';

    return String(source.payment_method ?? '').trim();
}

export function getPaymentMethodKind(label: string): PaymentMethodKind {
    const normalized = String(label ?? '').trim().toLowerCase();

    if (normalized === 'qris') return 'qris';
    if (['e-wallet', 'e wallet', 'ewallet', 'ovo', 'dana', 'gopay', 'shopeepay'].includes(normalized)) return 'ewallet';
    if (normalized === 'virtual account' || normalized === 'va' || normalized === 'va bank') return 'va';
    if (normalized === 'isi saldo' || normalized === 'top up') return 'topup';
    if (normalized === 'konversi saldo' || normalized === 'balance conversion') return 'conversion';

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
                kind === 'qris'
                        ? QrCode
                        : kind === 'ewallet' || kind === 'topup'
                            ? Wallet
                            : kind === 'va'
                                ? Landmark
                                : kind === 'conversion'
                                    ? ArrowLeftRight
                                    : null;

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
                kind === 'qris'
                        ? QrCode
                        : kind === 'ewallet' || kind === 'topup'
                            ? Wallet
                            : kind === 'va'
                                ? Landmark
                                : kind === 'conversion'
                                    ? ArrowLeftRight
                                    : null;

    return (
        <span className={className ?? 'inline-flex items-center gap-1.5'}>
            {Icon ? <Icon className="size-4" /> : null}
            <span>{label}</span>
        </span>
    );
}
