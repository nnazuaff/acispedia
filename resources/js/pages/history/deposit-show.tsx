import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentMethodInline } from '@/components/payment-method-badge';
import { useI18n } from '@/i18n/i18n-provider';

type DepositDetail = {
    id: number;
    amount: number;
    final_amount: number;
    status: string;
    payment_method: string;
    tripay_method: string | null;
    tripay_merchant_ref: string | null;
    tripay_reference: string | null;
    tripay_pay_code: string | null;
    tripay_checkout_url: string | null;
    tripay_status: string | null;
    created_at: string | null;
    expired_at: string | null;
    processed_at: string | null;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function fmtDate(iso: string | null): string {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleString('id-ID');
    } catch {
        return iso;
    }
}

function methodLabel(row: { payment_method: string; tripay_method: string | null }): string {
    const tripay = String(row.tripay_method ?? '').trim();
    const upper = tripay.toUpperCase();

    if (upper === 'QRIS2' || upper.startsWith('QRIS')) {
        return 'QRIS';
    }

    if (['OVO', 'DANA', 'SHOPEEPAY'].includes(upper)) {
        return 'E-Wallet';
    }

    if (upper.endsWith('VA')) {
        return 'Virtual Account';
    }

    if (tripay) {
        return tripay;
    }

    const payment = String(row.payment_method ?? '').trim();
    if (payment.toLowerCase() === 'tripay') {
        return 'Pembayaran';
    }

    return payment;
}

function getCookie(name: string): string | null {
    const parts = document.cookie.split(';');
    for (const part of parts) {
        const [rawKey, ...rest] = part.trim().split('=');
        if (rawKey === name) {
            return rest.join('=') || '';
        }
    }
    return null;
}

function getXsrfToken(): string | null {
    const token = getCookie('XSRF-TOKEN');
    return token ? decodeURIComponent(token) : null;
}

function badgeVariantForStatus(
    status: string
): React.ComponentProps<typeof Badge>['variant'] {
    const s = (status ?? '').toLowerCase();

    if (s === 'success') return 'secondary';
    if (s === 'failed' || s === 'error') return 'destructive';
    if (s === 'expired') return 'outline';
    if (s === 'canceled' || s === 'cancelled') return 'outline';

    return 'default';
}

function badgeClassNameForStatus(status: string): string {
    const s = (status ?? '').toLowerCase();

    if (s === 'pending') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
    if (s === 'success') return 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300';
    if (s === 'failed' || s === 'error') return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
    if (s === 'expired') return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    if (s === 'canceled' || s === 'cancelled') return 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300';

    return '';
}

function statusLabel(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s === 'pending') return 'Menunggu';
    if (s === 'success') return 'Berhasil';
    if (s === 'failed' || s === 'error') return 'Gagal';
    if (s === 'expired') return 'Kadaluarsa';
    if (s === 'canceled' || s === 'cancelled') return 'Dibatalkan';
    return status;
}

async function cancelDeposit(id: number) {
    try {
        const xsrf = getXsrfToken();
        const res = await fetch(`/api/deposits/${id}/cancel`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
            },
            credentials: 'same-origin',
        });

        const json = (await res.json()) as any;
        if (!res.ok || !json?.success) {
            toast.error(json?.message ?? 'Gagal membatalkan deposit.');
            return;
        }

        toast.success(json?.message ?? 'Deposit dibatalkan.');
        router.reload();
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
        toast.error(msg);
    }
}

export default function DepositShowPage() {
    const { deposit } = usePage().props as any as { deposit: DepositDetail };
    const { t } = useI18n();

    const statusUpper = t(statusLabel(deposit.status)).toUpperCase();

    return (
        <>
            <Head title={t('Detail deposit')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        variant="small"
                        title={t('Detail deposit')}
                        description={`${t('Deposit')} #${deposit.id}`}
                    />
                    <Button asChild variant="outline">
                        <Link href="/history/deposit" prefetch>
                            {t('Kembali')}
                        </Link>
                    </Button>
                </div>

                <Card className="py-4">
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t('Status')}
                                </div>
                                <div className="mt-2">
                                    <Badge
                                        variant={badgeVariantForStatus(deposit.status)}
                                        className={badgeClassNameForStatus(deposit.status)}
                                    >
                                        {statusUpper}
                                    </Badge>
                                </div>

                                <div className="mt-4 grid gap-2 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Tanggal')}</span>
                                        <span className="font-medium">{fmtDate(deposit.created_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Nominal')}</span>
                                        <span className="font-medium">Rp {formatRupiah(deposit.final_amount ?? deposit.amount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Metode')}</span>
                                        <PaymentMethodInline
                                            className="font-medium"
                                            label={methodLabel({ payment_method: deposit.payment_method, tripay_method: deposit.tripay_method })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {deposit.status === 'pending' && deposit.tripay_checkout_url ? (
                                        <Button asChild variant="outline">
                                            <a href={deposit.tripay_checkout_url} target="_blank" rel="noopener noreferrer">
                                                {t('Bayar')}
                                            </a>
                                        </Button>
                                    ) : null}

                                    {deposit.status === 'pending' ? (
                                        <Button type="button" variant="destructive" onClick={() => cancelDeposit(deposit.id)}>
                                            {t('Batalkan')}
                                        </Button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t('Referensi')}
                                </div>

                                <div className="mt-4 grid gap-2 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Merchant ref')}</span>
                                        <span className="font-medium">{deposit.tripay_merchant_ref ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Reference')}</span>
                                        <span className="font-medium">{deposit.tripay_reference ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Pay code')}</span>
                                        <span className="font-medium">{deposit.tripay_pay_code ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Checkout')}</span>
                                        {deposit.tripay_checkout_url ? (
                                            <a
                                                className="font-medium underline underline-offset-4"
                                                href={deposit.tripay_checkout_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {t('Buka')}
                                            </a>
                                        ) : (
                                            <span className="font-medium">-</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Status pembayaran')}</span>
                                        <span className="font-medium">{deposit.tripay_status ?? '-'}</span>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-2 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Expired</span>
                                        <span className="font-medium">{fmtDate(deposit.expired_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Diproses</span>
                                        <span className="font-medium">{fmtDate(deposit.processed_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DepositShowPage.layout = {
    breadcrumbs: [
        {
            title: 'Detail Deposit',
            href: '/history/deposit',
        },
    ],
};
