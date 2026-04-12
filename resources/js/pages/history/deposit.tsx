import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { Copy, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { useConfirm } from '@/components/confirm-dialog-provider';
import { useI18n } from '@/i18n/i18n-provider';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PaymentMethodBadge } from '@/components/payment-method-badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useClipboard } from '@/hooks/use-clipboard';
import { canUseMidtransSnap, openMidtransSnapPopup } from '@/lib/midtrans-snap';

type DepositRow = {
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
    created_at_wib: string | null;
    expired_at: string | null;
    expired_at_wib: string | null;
    processed_at: string | null;
    processed_at_wib: string | null;
};

type DepositDetail = DepositRow;

type DepositsPaginator = {
    data: DepositRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    q: string;
    status: string;
    method: string;
    ewallet_code?: string;
    year: number;
    per_page: number;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function adminFee(amount: number, finalAmount: number): number {
    const fee = (finalAmount ?? 0) - (amount ?? 0);
    return fee > 0 ? fee : 0;
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

function statusLabel(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s === 'pending') return 'Menunggu';
    if (s === 'success') return 'Berhasil';
    if (s === 'failed' || s === 'error') return 'Gagal';
    if (s === 'expired') return 'Kadaluarsa';
    if (s === 'canceled' || s === 'cancelled') return 'Dibatalkan';
    return status;
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
    const normalized = (status ?? '').toLowerCase();

    if (normalized === 'success') {
        return 'secondary';
    }

    if (normalized === 'failed' || normalized === 'error') {
        return 'destructive';
    }

    if (normalized === 'expired') {
        return 'outline';
    }

    if (normalized === 'canceled' || normalized === 'cancelled') {
        return 'outline';
    }

    return 'default';
}

function badgeClassNameForStatus(status: string): string {
    const s = (status ?? '').toLowerCase();

    if (s === 'pending') {
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
    }

    if (s === 'success') {
        return 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300';
    }

    if (s === 'expired') {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    }

    if (s === 'canceled' || s === 'cancelled') {
        return 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300';
    }

    if (s === 'failed' || s === 'error') {
        return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
    }

    return '';
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

        // Refresh handled by caller to keep URL clean.
    } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Kesalahan tidak diketahui.');
    }
}

export default function HistoryDepositPage() {
    const { t, locale } = useI18n();
    const confirm = useConfirm();
    const { auth, deposits: depositsProp, filters: filtersProp, midtrans_client_key: midtransClientKey, midtrans_snap_js_url: midtransSnapJsUrl } = usePage().props as any as {
        auth: { user?: { id?: number } };
        deposits: DepositsPaginator;
        filters: Filters;
        midtrans_client_key: string;
        midtrans_snap_js_url: string;
    };

    const [, copy] = useClipboard();
    const [openDetail, setOpenDetail] = React.useState<boolean>(false);
    const [selectedDeposit, setSelectedDeposit] = React.useState<DepositDetail | null>(null);

    const [q, setQ] = React.useState<string>(filtersProp?.q ?? '');
    const [status, setStatus] = React.useState<string>(filtersProp?.status ?? 'all');
    const [method, setMethod] = React.useState<string>(filtersProp?.method ?? 'all');
    const [ewalletCode, setEwalletCode] = React.useState<string>(filtersProp?.ewallet_code ?? 'all');
    const [year, setYear] = React.useState<number>(Number(filtersProp?.year ?? new Date().getFullYear()));
    const [perPage, setPerPage] = React.useState<number>(Number(filtersProp?.per_page ?? 25));

    React.useEffect(() => {
        setQ(filtersProp?.q ?? '');
        setStatus(filtersProp?.status ?? 'all');
        const nextMethod = filtersProp?.method === 'tripay' ? 'qris' : (filtersProp?.method ?? 'all');
        setMethod(nextMethod);
        setEwalletCode(filtersProp?.ewallet_code ?? 'all');
        setYear(Number(filtersProp?.year ?? new Date().getFullYear()));
        setPerPage(Number(filtersProp?.per_page ?? 25));
    }, [filtersProp?.q, filtersProp?.status, filtersProp?.method, filtersProp?.ewallet_code, filtersProp?.year, filtersProp?.per_page]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.location.search) {
            try {
                window.history.replaceState({}, '', '/history/deposit');
            } catch {
                // ignore
            }
        }
    }, []);

    const rowsFromServer = Array.isArray(depositsProp?.data) ? depositsProp.data : [];
    const [rows, setRows] = React.useState<DepositRow[]>(rowsFromServer);

    React.useEffect(() => {
        setRows(rowsFromServer);
    }, [depositsProp?.current_page, depositsProp?.total, depositsProp?.data]);

    const from = depositsProp?.from ?? (rows.length > 0 ? 1 : 0);
    const to = depositsProp?.to ?? rows.length;
    const total = depositsProp?.total ?? rows.length;

    const currentYear = new Date().getFullYear();

    function openDetailById(id: number) {
        const row = rows.find((item) => Number(item.id) === Number(id)) ?? null;
        setSelectedDeposit(row);
        setOpenDetail(Boolean(row));
    }

    function closeDetail() {
        setOpenDetail(false);
        setSelectedDeposit(null);
    }

    function payFromDetail(row: Pick<DepositRow, 'payment_method' | 'payment_url' | 'snap_token'>) {
        closeDetail();
        window.setTimeout(() => {
            void openPayment(row);
        }, 0);
    }

    async function openPayment(row: Pick<DepositRow, 'payment_method' | 'payment_url' | 'snap_token'>) {
        const paymentUrl = String(row.payment_url ?? '').trim();
        const snapToken = String(row.snap_token ?? '').trim();
        const isMidtrans = String(row.payment_method ?? '').toLowerCase() === 'midtrans';

        if (isMidtrans && canUseMidtransSnap({ snapJsUrl: midtransSnapJsUrl, clientKey: midtransClientKey, snapToken })) {
            try {
                await openMidtransSnapPopup({
                    snapJsUrl: midtransSnapJsUrl,
                    clientKey: midtransClientKey,
                    snapToken,
                    onSuccess: () => {
                        router.reload({ preserveScroll: true } as any);
                    },
                    onPending: () => {
                        router.reload({ preserveScroll: true } as any);
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

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const merged: Partial<Filters> = {
            q,
            status,
            method,
            ewallet_code: ewalletCode,
            year,
            per_page: perPage,
            ...next,
        };

        const params: Record<string, any> = {};

        const nextQ = String(merged.q ?? '').trim();
        if (nextQ !== '') params.q = nextQ;

        const nextStatus = String(merged.status ?? 'all');
        if (nextStatus !== 'all') params.status = nextStatus;

        const nextMethod = String(merged.method ?? 'all');
        if (nextMethod !== 'all') params.method = nextMethod;

        if (nextMethod === 'ewallet') {
            const nextEwallet = String(merged.ewallet_code ?? 'all');
            if (nextEwallet !== 'all') params.ewallet_code = nextEwallet;
        }

        const nextYear = Number(merged.year ?? currentYear);
        if (Number.isFinite(nextYear) && nextYear !== currentYear) params.year = nextYear;

        const nextPerPage = Number(merged.per_page ?? 25);
        if (Number.isFinite(nextPerPage) && nextPerPage !== 25) params.per_page = nextPerPage;

        const nextPage = Number((merged as any).page ?? 1);
        if (Number.isFinite(nextPage) && nextPage > 1) params.page = nextPage;

        router.get(
            '/history/deposit',
            params,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    try {
                        window.history.replaceState({}, '', '/history/deposit');
                    } catch {
                        // ignore
                    }
                },
            }
        );
    }
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

    React.useEffect(() => {
        if (method !== 'ewallet') {
            setEwalletCode('all');
        }
    }, [method]);

    React.useEffect(() => {
        const uid = Number(auth?.user?.id);
        if (!Number.isFinite(uid) || uid <= 0) {
            return;
        }

        const echo = (window as any)?.Echo;
        if (!echo) {
            return;
        }

        const channelName = `deposits.${uid}`;
        const channel = echo.private(channelName);

        channel.listen('.deposit.status.updated', (payload: any) => {
            const deposit = payload?.deposit;
            if (!deposit || typeof deposit !== 'object') {
                return;
            }

            const nextId = Number(deposit.id);
            if (!Number.isFinite(nextId)) {
                return;
            }

            setRows((prev) => {
                const exists = prev.some((item) => Number(item.id) === nextId);
                if (!exists) {
                    return [deposit as DepositRow, ...prev].slice(0, Math.max(prev.length, 1));
                }

                return prev.map((item) =>
                    Number(item.id) === nextId
                        ? {
                              ...item,
                              ...(deposit as Partial<DepositRow>),
                          }
                        : item
                );
            });

            setSelectedDeposit((prev) =>
                prev && Number(prev.id) === nextId
                    ? {
                          ...prev,
                          ...deposit,
                      }
                    : prev
            );
        });

        return () => {
            try {
                echo.leave(channelName);
            } catch {
                // ignore
            }
        };
    }, [auth?.user?.id]);

    return (
        <>
            <Head title={t('Riwayat Deposit')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        variant="small"
                        title={t('Riwayat Deposit')}
                        description={t('Daftar deposit saldo Anda.')}
                    />
                    <Button asChild>
                        <Link href="/deposit" prefetch>
                            {t('Isi Saldo')}
                        </Link>
                    </Button>
                </div>

                <Card className="py-4">
                    <CardHeader>
                        <div className={`grid gap-3 ${method === 'ewallet' ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
                            <div className="sm:col-span-2">
                                <Label htmlFor="q">{t('Pencarian')}</Label>
                                <Input
                                    id="q"
                                    className="mt-1"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder={t('Cari reference, pay code, atau metode...')}
                                />
                            </div>

                            <div>
                                <Label>{t('Status')}</Label>
                                <Select value={status} onValueChange={(v) => setStatus(v)}>
                                    <SelectTrigger className="mt-1 h-9 w-full">
                                        <SelectValue placeholder={t('Semua')} />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="all">{t('Semua')}</SelectItem>
                                        <SelectItem value="pending">{t('Menunggu')}</SelectItem>
                                        <SelectItem value="success">{t('Berhasil')}</SelectItem>
                                        <SelectItem value="failed">{t('Gagal')}</SelectItem>
                                        <SelectItem value="expired">{t('Kadaluarsa')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{t('Metode')}</Label>
                                <Select value={method} onValueChange={(v) => setMethod(v)}>
                                    <SelectTrigger className="mt-1 h-9 w-full">
                                        <SelectValue placeholder={t('Semua')} />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="all">{t('Semua')}</SelectItem>
                                        <SelectItem value="qris">QRIS</SelectItem>
                                        <SelectItem value="midtrans">{t('Isi Saldo')}</SelectItem>
                                        <SelectItem value="ewallet">E-Wallet</SelectItem>
                                        <SelectItem value="konversi_saldo">{t('Konversi Saldo')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {method === 'ewallet' ? (
                                <div>
                                    <Label>E-Wallet</Label>
                                    <Select value={ewalletCode} onValueChange={(v) => setEwalletCode(v)}>
                                        <SelectTrigger className="mt-1 h-9 w-full">
                                            <SelectValue placeholder={t('Semua')} />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            <SelectItem value="all">{t('Semua')}</SelectItem>
                                            <SelectItem value="OVO">OVO</SelectItem>
                                            <SelectItem value="DANA">DANA</SelectItem>
                                            <SelectItem value="SHOPEEPAY">ShopeePay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                            <Button type="button" onClick={() => applyFilters({})}>
                                {t('Terapkan')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setQ('');
                                    setStatus('all');
                                    setMethod('all');
                                    setEwalletCode('all');
                                    setYear(currentYear);
                                    setPerPage(25);
                                    applyFilters({ q: '', status: 'all', method: 'all', ewallet_code: 'all', year: currentYear, per_page: 25 });
                                }}
                            >
                                {t('Reset')}
                            </Button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm text-muted-foreground">
                            <div>
                                {locale === 'en'
                                    ? `Showing ${from}-${to} of ${total}${depositsProp?.last_page ? ` (Page ${depositsProp.current_page} / ${depositsProp.last_page})` : ''}`
                                    : `Menampilkan ${from}-${to} dari ${total}${depositsProp?.last_page ? ` (Halaman ${depositsProp.current_page} / ${depositsProp.last_page})` : ''}`}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-hidden rounded-lg border">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/30">
                                        <tr className="text-left">
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Tanggal')}</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Nominal')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Biaya admin')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Total bayar')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Saldo masuk')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Metode')}</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Status')}</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={8}>
                                                    {t('Belum ada deposit.')}
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => {
                                                const dateText = row.created_at_wib ?? '-';
                                                const methodText = methodLabel(row);
                                                const statusText = t(statusLabel(row.status));

                                                const fee = adminFee(row.amount, row.final_amount);
                                                const totalPay = row.final_amount ?? row.amount;
                                                const saldoMasuk = row.amount;

                                                return (
                                                    <tr key={row.id} className="border-t">
                                                        <td className="px-4 py-3 whitespace-nowrap">{dateText}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            Rp {formatRupiah(row.amount)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">Rp {formatRupiah(fee)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">Rp {formatRupiah(totalPay)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">Rp {formatRupiah(saldoMasuk)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <PaymentMethodBadge label={methodText} />
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <Badge
                                                                variant={badgeVariantForStatus(row.status)}
                                                                className={badgeClassNameForStatus(row.status)}
                                                            >
                                                                {statusText.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="outline">
                                                                        <MoreHorizontal className="size-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => openDetailById(row.id)}
                                                                    >
                                                                        {t('Detail')}
                                                                    </DropdownMenuItem>
                                                                    {row.status === 'pending' && (row.payment_url || row.snap_token) ? (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem onClick={() => void openPayment(row)}>
                                                                                {t('Bayar')}
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    ) : null}

                                                                    {row.status === 'pending' ? (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                className="text-destructive"
                                                                                onClick={async () => {
                                                                                    const ok = await confirm({
                                                                                        title: t('Batalkan deposit ini?'),
                                                                                        confirmText: t('Batalkan'),
                                                                                        cancelText: t('Kembali'),
                                                                                        variant: 'destructive',
                                                                                    });
                                                                                    if (!ok) return;
                                                                                    cancelDeposit(row.id)
                                                                                        .then(() => applyFilters({ page: depositsProp?.current_page ?? 1 }))
                                                                                        .catch(() => {
                                                                                            // ignore: cancelDeposit already alerts
                                                                                        });
                                                                                }}
                                                                            >
                                                                                {t('Batalkan')}
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    ) : null}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>{t('Tahun')}</span>
                                    <Select
                                        value={String(year)}
                                        onValueChange={(v) => {
                                            const next = Number(v);
                                            setYear(next);
                                            applyFilters({ year: next, page: 1 });
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-28">
                                            <SelectValue placeholder={String(currentYear)} />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            {yearOptions.map((y) => (
                                                <SelectItem key={y} value={String(y)}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                {Number(depositsProp?.current_page ?? 1) > 1 ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => applyFilters({ page: Number(depositsProp?.current_page ?? 1) - 1 })}
                                    >
                                        {t('Sebelumnya')}
                                    </Button>
                                ) : (
                                    <Button variant="outline" disabled>
                                        {t('Sebelumnya')}
                                    </Button>
                                )}

                                {Number(depositsProp?.current_page ?? 1) < Number(depositsProp?.last_page ?? 1) ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => applyFilters({ page: Number(depositsProp?.current_page ?? 1) + 1 })}
                                    >
                                        {t('Berikutnya')}
                                    </Button>
                                ) : (
                                    <Button variant="outline" disabled>
                                        {t('Berikutnya')}
                                    </Button>
                                )}

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{t('Data')}:</span>
                                    <Select
                                        value={String(perPage)}
                                        onValueChange={(v) => {
                                            const next = Number(v);
                                            setPerPage(next);
                                            applyFilters({ per_page: next, page: 1 });
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-24">
                                            <SelectValue placeholder="25" />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            {[25, 50, 100, 200].map((n) => (
                                                <SelectItem key={n} value={String(n)}>
                                                    {n}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog
                    open={openDetail}
                    onOpenChange={(next) => {
                        setOpenDetail(next);
                        if (!next) closeDetail();
                    }}
                >
                    <DialogContent className="max-h-[calc(100vh-2rem)] overflow-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t('Detail Deposit')}</DialogTitle>
                        </DialogHeader>

                        {selectedDeposit ? (
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('ID Deposit')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                                <div className="text-sm font-semibold">#{selectedDeposit.id}</div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() => copy(String(selectedDeposit.id))}
                                                aria-label={t('Salin ID')}
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Tanggal')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium">{selectedDeposit.created_at_wib ?? '-'}</div>
                                            {selectedDeposit.created_at_wib ? (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => copy(String(selectedDeposit.created_at_wib))}
                                                        aria-label={t('Salin tanggal')}
                                                >
                                                    <Copy className="size-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Nominal')}
                                        </div>
                                        <div className="text-sm font-semibold">Rp {formatRupiah(selectedDeposit.amount)}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Biaya admin')}
                                        </div>
                                        <div className="text-sm font-medium">
                                            Rp {formatRupiah(adminFee(selectedDeposit.amount, selectedDeposit.final_amount))}
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Total bayar')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-semibold">
                                                Rp {formatRupiah(selectedDeposit.final_amount ?? selectedDeposit.amount)}
                                            </div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    copy(String(selectedDeposit.final_amount ?? selectedDeposit.amount))
                                                }
                                                aria-label={t('Salin total')}
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Saldo masuk')}
                                        </div>
                                        <div className="text-sm font-semibold">Rp {formatRupiah(selectedDeposit.amount)}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Metode')}
                                        </div>
                                        <div className="text-sm font-medium">
                                                {methodLabel(selectedDeposit)}
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Status')}
                                        </div>
                                        <div>
                                            <Badge
                                                variant={badgeVariantForStatus(selectedDeposit.status)}
                                                className={badgeClassNameForStatus(selectedDeposit.status)}
                                            >
                                                    {t(statusLabel(selectedDeposit.status)).toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Kadaluarsa pada')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium">{selectedDeposit.expired_at_wib ?? '-'}</div>
                                            {selectedDeposit.expired_at_wib ? (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => copy(String(selectedDeposit.expired_at_wib))}
                                                        aria-label={t('Salin kadaluarsa')}
                                                >
                                                    <Copy className="size-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                {selectedDeposit.provider_reference ? (
                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Referensi provider')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium">{selectedDeposit.provider_reference}</div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() => copy(String(selectedDeposit.provider_reference))}
                                                aria-label={t('Salin referensi')}
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}

                                {selectedDeposit.provider_status ? (
                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Status pembayaran')}
                                        </div>
                                        <div className="text-sm font-medium">{providerStatusLabel(selectedDeposit.provider_status)}</div>
                                    </div>
                                ) : null}

                                {selectedDeposit.status === 'pending' && (selectedDeposit.payment_url || selectedDeposit.snap_token) ? (
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => payFromDetail(selectedDeposit)}
                                        >
                                            {t('Bayar')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: t('Batalkan deposit ini?'),
                                                    confirmText: t('Batalkan'),
                                                    cancelText: t('Kembali'),
                                                    variant: 'destructive',
                                                });
                                                if (ok) cancelDeposit(selectedDeposit.id);
                                            }}
                                        >
                                            {t('Batalkan')}
                                        </Button>
                                    </div>
                                ) : selectedDeposit.status === 'pending' ? (
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: t('Batalkan deposit ini?'),
                                                    confirmText: t('Batalkan'),
                                                    cancelText: t('Kembali'),
                                                    variant: 'destructive',
                                                });
                                                if (ok) cancelDeposit(selectedDeposit.id);
                                            }}
                                        >
                                            {t('Batalkan')}
                                        </Button>
                                    </div>
                                ) : null}

                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">{t('Data tidak ditemukan.')}</div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

HistoryDepositPage.layout = {
    breadcrumbs: [
        {
            title: 'Riwayat Deposit',
            href: '/history/deposit',
        },
    ],
};
