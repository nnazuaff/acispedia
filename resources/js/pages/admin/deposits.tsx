import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import AdminDateRangePicker from '@/components/admin-date-range-picker';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getPaymentMethodLabel } from '@/components/payment-method-badge';
import { useI18n } from '@/i18n/i18n-provider';

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
    payment_channel: string | null;
    provider_reference: string | null;
    provider_transaction_id: string | null;
    provider_status: string | null;
    created_at_wib: string | null;
    expired_at_wib: string | null;
    processed_at_wib: string | null;
    user?: {
        id: number;
        name: string | null;
        email: string | null;
    };
};

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

type Stats = {
    total: number;
    success: number;
    pending: number;
    expired: number;
    failed: number;
    canceled: number;
};

type Filters = {
    q: string;
    id: string;
    user_id: string;
    status: string;
    method: string;
    date_from: string;
    date_to: string;
    per_page: number;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function depositStatusMeta(status: string, t: (key: string) => string): { label: string; className: string } {
    const key = String(status ?? '').toLowerCase();
    if (key === 'success') return { label: t('Sukses'), className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
    if (key === 'pending') return { label: t('Pending'), className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
    if (key === 'failed') return { label: t('Gagal'), className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300' };
    if (key === 'expired') return { label: t('Expired'), className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
    if (key === 'canceled' || key === 'cancelled') return { label: t('Canceled'), className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
    return { label: status || '-', className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
}

export default function AdminDeposits() {
    const { t } = useI18n();
    const { deposits, stats, filters, known_statuses } = usePage().props as any as {
        deposits: DepositsPaginator;
        stats: Stats;
        filters: Filters;
        known_statuses: string[];
    };

    const [q, setQ] = React.useState(filters?.q ?? '');
    const [id, setId] = React.useState(filters?.id ?? '');
    const [userId, setUserId] = React.useState(filters?.user_id ?? '');
    const [status, setStatus] = React.useState(filters?.status ?? '');
    const [method, setMethod] = React.useState(filters?.method ?? '');
    const [dateFrom, setDateFrom] = React.useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = React.useState(filters?.date_to ?? '');
    const [perPage, setPerPage] = React.useState<number>(Number(filters?.per_page ?? 25));

    React.useEffect(() => {
        setQ(filters?.q ?? '');
        setId(filters?.id ?? '');
        setUserId(filters?.user_id ?? '');
        setStatus(filters?.status ?? '');
        setMethod(filters?.method ?? '');
        setDateFrom(filters?.date_from ?? '');
        setDateTo(filters?.date_to ?? '');
        setPerPage(Number(filters?.per_page ?? 25));
    }, [filters?.q, filters?.id, filters?.user_id, filters?.status, filters?.method, filters?.date_from, filters?.date_to, filters?.per_page]);

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const merged = {
            q,
            id,
            user_id: userId,
            status,
            method,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: perPage,
            ...(next ?? {}),
        };

        router.get(
            '/deposits',
            {
                ...merged,
                id: String(merged.id ?? '').trim(),
                user_id: String(merged.user_id ?? '').trim(),
            } as any,
            {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            }
        );
    }

    function resetFilters() {
        setQ('');
        setId('');
        setUserId('');
        setStatus('');
        setMethod('');
        const today = new Date().toISOString().slice(0, 10);
        setDateFrom(today);
        setDateTo(today);
        setPerPage(25);

        router.get(
            '/deposits',
            {
                q: '',
                id: '',
                user_id: '',
                status: '',
                method: '',
                date_from: today,
                date_to: today,
                per_page: 25,
            } as any,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    }

    const rows = Array.isArray(deposits?.data) ? deposits.data : [];

    return (
        <>
            <Head title={t('Deposit')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Deposit')}
                    description={t('Manajemen deposit admin.')}
                />

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Sukses')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.success ?? 0)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Pending')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.pending ?? 0)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-500/30 bg-slate-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Expired')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.expired ?? 0)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/30 bg-red-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Gagal')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.failed ?? 0)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-500/30 bg-slate-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Canceled')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.canceled ?? 0)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sky-500/30 bg-sky-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.total ?? 0)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
                            <div className="lg:col-span-2">
                                <Label htmlFor="q">{t('Cari')}</Label>
                                <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('nama / email / ID deposit / nominal')} />
                            </div>

                            <div>
                                <Label htmlFor="id">{t('ID Deposit')}</Label>
                                <Input
                                    id="id"
                                    value={id}
                                    onChange={(e) => setId(e.target.value.replace(/\D+/g, ''))}
                                    placeholder=""
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            </div>

                            <div>
                                <Label htmlFor="user_id">{t('User ID')}</Label>
                                <Input
                                    id="user_id"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value.replace(/\D+/g, ''))}
                                    placeholder=""
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            </div>

                            <div>
                                <Label>{t('Status')}</Label>
                                <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('-- Semua --')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('Semua')}</SelectItem>
                                        {(known_statuses ?? []).map((st) => (
                                            <SelectItem key={st} value={st}>
                                                {st}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{t('Metode')}</Label>
                                <Select value={method || 'all'} onValueChange={(v) => setMethod(v === 'all' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('-- Semua --')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('Semua')}</SelectItem>
                                        <SelectItem value="isi_saldo">{t('Isi Saldo')}</SelectItem>
                                        <SelectItem value="qris">{t('QRIS')}</SelectItem>
                                        <SelectItem value="va_bank">{t('VA Bank')}</SelectItem>
                                        <SelectItem value="ewallet">{t('E-Wallet')}</SelectItem>
                                        <SelectItem value="konversi_saldo">{t('Konversi Saldo')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="lg:col-span-2">
                                <Label htmlFor="date_from">{t('Rentang Tanggal')}</Label>
                                <AdminDateRangePicker
                                    id="date_from"
                                    valueFrom={dateFrom}
                                    valueTo={dateTo}
                                    onChange={({ from, to }) => {
                                        setDateFrom(from);
                                        setDateTo(to);
                                    }}
                                    placeholder={t('Pilih tanggal')}
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <Button onClick={() => applyFilters({ page: 1 })}>{t('Filter')}</Button>
                                <Button variant="outline" onClick={resetFilters}>
                                    {t('Atur Ulang')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('ID')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dibuat')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Pengguna')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Jumlah')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Metode')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Status')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Aksi')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">#{row.id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.user?.id ? (
                                                        <Link
                                                            href={`/users/${row.user.id}`}
                                                            className="font-medium text-primary hover:underline"
                                                            prefetch
                                                        >
                                                            {row.user?.name || row.user?.email || '-'}
                                                        </Link>
                                                    ) : (
                                                        <>{row.user?.name || row.user?.email || '-'}</>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(row.amount ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{t(getPaymentMethodLabel(row))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {(() => {
                                                        const meta = depositStatusMeta(row.status, t);
                                                        return (
                                                            <Badge variant="outline" className={meta.className}>
                                                                {meta.label}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/deposits/${row.id}`} prefetch>
                                                            {t('Detail')}
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                {t('Menampilkan')} {deposits?.from ?? 0}–{deposits?.to ?? rows.length} {t('dari')} {deposits?.total ?? rows.length}
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!deposits?.prev_page_url}
                                    onClick={() => {
                                        if (deposits?.prev_page_url) router.visit(deposits.prev_page_url);
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!deposits?.next_page_url}
                                    onClick={() => {
                                        if (deposits?.next_page_url) router.visit(deposits.next_page_url);
                                    }}
                                >
                                    {t('Berikutnya')}
                                </Button>

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
                                            <SelectValue />
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
            </div>
        </>
    );
}

AdminDeposits.layout = {
    breadcrumbs: [
        {
            title: 'Deposit',
            href: '/deposits',
        },
    ],
};
