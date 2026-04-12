import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentMethodInline } from '@/components/payment-method-badge';
import { useI18n } from '@/i18n/i18n-provider';
import { canUseMidtransSnap, openMidtransSnapPopup } from '@/lib/midtrans-snap';

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
    payment_url: string | null;
    snap_token?: string | null;
    payment_channel: string | null;
    provider_reference: string | null;
    provider_transaction_id: string | null;
    provider_status: string | null;
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

function methodLabel(row: { payment_method: string; tripay_method: string | null; payment_channel?: string | null }): string {
    const channel = String(row.payment_channel ?? row.tripay_method ?? '').trim();
    const upper = channel.toUpperCase();

    if (upper === 'QRIS2' || upper.startsWith('QRIS')) {
        return 'QRIS';
    }

    if (upper === 'GOPAY') {
        return 'GoPay';
    }

    if (upper === 'SHOPEEPAY') {
        return 'ShopeePay';
    }

    if (['OVO', 'DANA'].includes(upper)) {
        return upper;
    }

    if (upper.endsWith('VA') || upper.endsWith('_TRANSFER') || upper.includes('TRANSFER')) {
        return 'VA Bank';
    }

    if (channel) {
        return channel;
    }

    const payment = String(row.payment_method ?? '').trim();
    if (payment.toLowerCase() === 'konversi_saldo') {
        return 'Konversi Saldo';
    }
    if (payment.toLowerCase() === 'midtrans') {
        return 'Isi Saldo';
    }
    if (payment.toLowerCase() === 'tripay') {
        return 'Pembayaran';
    }

    return payment;
}

function providerStatusLabel(status: string | null | undefined): string {
    const normalized = String(status ?? '').trim().toLowerCase();

    if (normalized === '') return '-';
    if (['settlement', 'capture', 'success', 'paid'].includes(normalized)) return 'Berhasil';
    if (['pending', 'authorize'].includes(normalized)) return 'Menunggu Pembayaran';
    if (['expire', 'expired'].includes(normalized)) return 'Kadaluarsa';
    if (['cancel', 'cancelled'].includes(normalized)) return 'Dibatalkan';
    if (['deny', 'failure', 'failed', 'error'].includes(normalized)) return 'Gagal';
    if (normalized === 'refund') return 'Dikembalikan';
    if (normalized === 'partial_refund') return 'Refund Sebagian';
    if (normalized === 'challenge') return 'Perlu Verifikasi';

    return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
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
    const { deposit, midtrans_client_key: midtransClientKey, midtrans_snap_js_url: midtransSnapJsUrl } = usePage().props as any as {
        deposit: DepositDetail;
        midtrans_client_key: string;
        midtrans_snap_js_url: string;
    };
    const { t } = useI18n();

    const statusUpper = t(statusLabel(deposit.status)).toUpperCase();

    async function openPayment() {
        const paymentUrl = String(deposit.payment_url ?? '').trim();
        const snapToken = String(deposit.snap_token ?? '').trim();
        const isMidtrans = String(deposit.payment_method ?? '').toLowerCase() === 'midtrans';

        if (isMidtrans && canUseMidtransSnap({ snapJsUrl: midtransSnapJsUrl, clientKey: midtransClientKey, snapToken })) {
            try {
                await openMidtransSnapPopup({
                    snapJsUrl: midtransSnapJsUrl,
                    clientKey: midtransClientKey,
                    snapToken,
                    onSuccess: () => {
                        toast.success('Pembayaran sukses. Status deposit akan diperbarui otomatis.');
                        router.reload();
                    },
                    onPending: () => {
                        toast.warning('Pembayaran masih menunggu penyelesaian.');
                        router.reload();
                    },
                    onError: () => {
                        toast.error('Terjadi masalah saat memproses pembayaran.');
                    },
                    onClose: () => {},
                });
                return;
            } catch (error) {
                if (paymentUrl === '') {
                    toast.error(error instanceof Error ? error.message : 'Gagal membuka halaman pembayaran.');
                }
            }
        }

        if (paymentUrl !== '') {
            window.location.assign(paymentUrl);
        }
    }

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
                                            label={methodLabel({ payment_method: deposit.payment_method, tripay_method: deposit.tripay_method, payment_channel: deposit.payment_channel })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {deposit.status === 'pending' && (deposit.payment_url || deposit.snap_token) ? (
                                        <Button type="button" variant="outline" onClick={() => void openPayment()}>
                                            {t('Bayar')}
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
                                        <span className="text-muted-foreground">{t('Kode pembayaran')}</span>
                                        <span className="font-medium">{deposit.provider_reference ?? deposit.tripay_merchant_ref ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('ID transaksi')}</span>
                                        <span className="font-medium">{deposit.provider_transaction_id ?? deposit.tripay_reference ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Metode pembayaran')}</span>
                                        <span className="font-medium">{methodLabel({ payment_method: deposit.payment_method, tripay_method: deposit.tripay_method, payment_channel: deposit.payment_channel })}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">{t('Lanjutkan pembayaran')}</span>
                                        {deposit.payment_url ? (
                                            <a
                                                className="font-medium underline underline-offset-4"
                                                href={deposit.payment_url}
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
                                        <span className="font-medium">{providerStatusLabel(deposit.provider_status ?? deposit.tripay_status)}</span>
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
