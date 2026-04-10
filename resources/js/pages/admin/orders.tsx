import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n/i18n-provider';

type OrderRow = {
    id: number;
    created_at_wib: string | null;
    service_name: string;
    target: string;
    quantity: number;
    total_price: number;
    status: string;
    provider_order_id: string | null;
    user?: {
        id: number;
        name: string | null;
        email: string | null;
    };
};

type OrdersPaginator = {
    data: OrderRow[];
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
    failed: number;
    other: number;
};

type Filters = {
    q: string;
    status: string;
    target: string;
    date_from: string;
    date_to: string;
    per_page: number;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminOrders() {
    const { t } = useI18n();
    const { orders, stats, filters, known_statuses } = usePage().props as any as {
        orders: OrdersPaginator;
        stats: Stats;
        filters: Filters;
        known_statuses: string[];
    };

    const [q, setQ] = React.useState(filters?.q ?? '');
    const [status, setStatus] = React.useState(filters?.status ?? '');
    const [target, setTarget] = React.useState(filters?.target ?? '');
    const [dateFrom, setDateFrom] = React.useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = React.useState(filters?.date_to ?? '');
    const [perPage, setPerPage] = React.useState<number>(Number(filters?.per_page ?? 20));

    React.useEffect(() => {
        setQ(filters?.q ?? '');
        setStatus(filters?.status ?? '');
        setTarget(filters?.target ?? '');
        setDateFrom(filters?.date_from ?? '');
        setDateTo(filters?.date_to ?? '');
        setPerPage(Number(filters?.per_page ?? 20));
    }, [filters?.q, filters?.status, filters?.target, filters?.date_from, filters?.date_to, filters?.per_page]);

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const merged = {
            q,
            status,
            target,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: perPage,
            ...(next ?? {}),
        };

        router.get('/orders', merged as any, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function resetFilters() {
        setQ('');
        setStatus('');
        setTarget('');
        const today = new Date().toISOString().slice(0, 10);
        setDateFrom(today);
        setDateTo(today);
        setPerPage(20);

        router.get(
            '/orders',
            {
                q: '',
                status: '',
                target: '',
                date_from: today,
                date_to: today,
                per_page: 20,
            } as any,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    }

    const rows = Array.isArray(orders?.data) ? orders.data : [];

    return (
        <>
            <Head title={t('Pesanan')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Pesanan')}
                    description={t('Manajemen pesanan admin.')}
                />

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Sukses')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {formatNumber(stats?.success ?? 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Gagal')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {formatNumber(stats?.failed ?? 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Lainnya')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {formatNumber(stats?.other ?? 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Total')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {formatNumber(stats?.total ?? 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <Label htmlFor="q">{t('Cari')}</Label>
                                <Input
                                    id="q"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder={t('nama pengguna / layanan')}
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <Label htmlFor="target">{t('Target / Tautan')}</Label>
                                <Input
                                    id="target"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <Label>{t('Status')}</Label>
                                <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Semua')} />
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
                                <Label htmlFor="date_from">{t('Dari Tanggal')}</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="date_to">{t('Sampai Tanggal')}</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>{t('Per Halaman')}</Label>
                                <Select
                                    value={String(perPage)}
                                    onValueChange={(v) => setPerPage(Number(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 20, 25, 50, 100].map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button onClick={() => applyFilters({ page: 1 })}>
                                    {t('Filter')}
                                </Button>
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('ID')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Dibuat')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Pengguna')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Layanan')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Target / Tautan')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Jumlah')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Total')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Status')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Aksi')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td
                                                className="px-4 py-6 text-center text-muted-foreground"
                                                colSpan={9}
                                            >
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    #{row.id}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.created_at_wib ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.user?.name || row.user?.email || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {row.service_name || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="break-all">
                                                        {row.target || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {formatNumber(Number(row.quantity ?? 0))}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    Rp {formatNumber(Number(row.total_price ?? 0))}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.status || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/orders/${row.id}`} prefetch>
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
                                {t('Menampilkan')}{' '}
                                {orders?.from ?? 0}–{orders?.to ?? rows.length} {t('dari')}{' '}
                                {orders?.total ?? rows.length}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!orders?.prev_page_url}
                                    onClick={() => {
                                        if (orders?.prev_page_url) router.visit(orders.prev_page_url);
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!orders?.next_page_url}
                                    onClick={() => {
                                        if (orders?.next_page_url) router.visit(orders.next_page_url);
                                    }}
                                >
                                    {t('Berikutnya')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminOrders.layout = {
    breadcrumbs: [
        {
            title: 'Pesanan',
            href: '/orders',
        },
    ],
};
