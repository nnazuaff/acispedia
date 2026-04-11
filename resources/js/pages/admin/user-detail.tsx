import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n/i18n-provider';

type UserDetail = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    created_at_wib: string | null;
    updated_at_wib: string | null;
    last_login_at_wib?: string | null;
    last_activity_at_wib?: string | null;
    balance: number;
    total_spent: number;
    total_deposit: number;
};

type OrderRow = {
    id: number;
    service_name: string;
    target: string;
    total_price: number;
    status: string;
    created_at_wib: string | null;
};

type DepositRow = {
    id: number;
    amount: number;
    final_amount: number;
    status: string;
    payment_method: string;
    tripay_method: string | null;
    created_at_wib: string | null;
};

type LedgerRow = {
    event_at_wib: string | null;
    direction: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    source_type: string;
    source_id: string | null;
    description: string;
};

type ActivityRow = {
    id: number;
    action: string;
    message: string;
    ip: string | null;
    created_at_wib: string | null;
    meta?: Record<string, any> | null;
};

type Paginator<T> = {
    data: T[];
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
    orders_per_page: number;
    deposits_per_page: number;
    activity_per_page: number;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminUserDetail() {
    const { t } = useI18n();

    const { user, orders, deposits, activity, ledger, filters } = usePage().props as any as {
        user: UserDetail;
        orders: Paginator<OrderRow>;
        deposits: Paginator<DepositRow>;
        activity: Paginator<ActivityRow>;
        ledger: LedgerRow[];
        filters: Filters;
    };

    const orderRows = Array.isArray(orders?.data) ? orders.data : [];
    const depositRows = Array.isArray(deposits?.data) ? deposits.data : [];
    const ledgerRows = Array.isArray(ledger) ? ledger : [];
    const activityRows = Array.isArray(activity?.data) ? activity.data : [];

    const [mode, setMode] = React.useState<'add' | 'subtract' | 'set'>('add');
    const [ordersPerPage, setOrdersPerPage] = React.useState<number>(Number(filters?.orders_per_page ?? 25));
    const [depositsPerPage, setDepositsPerPage] = React.useState<number>(Number(filters?.deposits_per_page ?? 25));
    const [activityPerPage, setActivityPerPage] = React.useState<number>(Number(filters?.activity_per_page ?? 25));

    React.useEffect(() => {
        setOrdersPerPage(Number(filters?.orders_per_page ?? 25));
        setDepositsPerPage(Number(filters?.deposits_per_page ?? 25));
        setActivityPerPage(Number(filters?.activity_per_page ?? 25));
    }, [filters?.orders_per_page, filters?.deposits_per_page, filters?.activity_per_page]);

    function applyFilters(next?: Partial<Filters> & { orders_page?: number; deposits_page?: number; activity_page?: number }) {
        router.get(
            `/users/${user.id}`,
            {
                orders_per_page: ordersPerPage,
                deposits_per_page: depositsPerPage,
                activity_per_page: activityPerPage,
                ...(next ?? {}),
            } as any,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    }

    return (
        <>
            <Head title={`${t('Detail Pengguna')} #${user?.id ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Detail Pengguna')} description={`#${user?.id ?? '-'}`} />

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href="/users" prefetch>
                            {t('Kembali')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={`/users/${user.id}/edit`} prefetch>
                            {t('Edit')}
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Saldo')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(user?.balance ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Deposit')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(user?.total_deposit ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Spent')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(user?.total_spent ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dibuat')}</div>
                            <div className="mt-2 text-2xl font-semibold">{user?.created_at_wib ?? '-'}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold">{t('Informasi')}</div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button type="button">{t('Atur Saldo')}</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('Atur Saldo')}</DialogTitle>
                                        <DialogDescription>
                                            {t('Admin dapat menambah, mengurangi, atau set saldo user secara manual (akan tercatat di log aktivitas admin).')}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Form action={`/users/${user.id}/balance`} method="post" className="mt-2 grid gap-3">
                                        {() => (
                                            <>
                                                <input type="hidden" name="mode" value={mode} />

                                                <div className="grid gap-2">
                                                    <Label>{t('Mode')}</Label>
                                                    <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('Pilih')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="add">{t('Tambah')}</SelectItem>
                                                            <SelectItem value="subtract">{t('Kurangi')}</SelectItem>
                                                            <SelectItem value="set">{t('Set Saldo')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="amount">{t('Jumlah (Rp)')}</Label>
                                                    <Input
                                                        id="amount"
                                                        name="amount"
                                                        inputMode="numeric"
                                                        placeholder={mode === 'set' ? '0' : '10000'}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="note">{t('Catatan (opsional)')}</Label>
                                                    <Input id="note" name="note" placeholder={t('contoh: penyesuaian manual')} />
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button type="submit">{t('Simpan')}</Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="mt-3 overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Kolom')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Nilai')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Nama')}</td>
                                        <td className="px-4 py-3">{user?.name || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Email')}</td>
                                        <td className="px-4 py-3">{user?.email || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Telepon')}</td>
                                        <td className="px-4 py-3">{user?.phone ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Terakhir Login')}</td>
                                        <td className="px-4 py-3">{user?.last_login_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Aktivitas Terakhir')}</td>
                                        <td className="px-4 py-3">{user?.last_activity_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Diperbarui')}</td>
                                        <td className="px-4 py-3">{user?.updated_at_wib ?? '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm font-semibold">{t('Mutasi Saldo')}</div>
                        <div className="mt-2 text-xs text-muted-foreground">{t('Riwayat perubahan saldo (50 data terakhir).')}</div>

                        <div className="mt-3 overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Waktu')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Arah')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Jumlah')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Sebelum')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Sesudah')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Sumber')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Keterangan')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerRows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        ledgerRows.map((r, idx) => (
                                            <tr key={`${r.event_at_wib ?? ''}-${idx}`} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">{r.event_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {r.direction === 'debit' ? t('Debit') : t('Kredit')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(r.amount ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(r.balance_before ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(r.balance_after ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {r.source_type}
                                                    {r.source_id ? `#${r.source_id}` : ''}
                                                </td>
                                                <td className="px-4 py-3">{r.description || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm font-semibold">{t('Aktivitas')}</div>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">{t('Data')}</div>
                                <Select
                                    value={String(activityPerPage)}
                                    onValueChange={(v) => {
                                        const next = Number(v);
                                        setActivityPerPage(next);
                                        applyFilters({ activity_per_page: next, activity_page: 1 });
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-24">
                                        <SelectValue placeholder={t('Pilih')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[25, 50, 100, 200].map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!activity?.prev_page_url}
                                    onClick={() => {
                                        if (activity?.prev_page_url) router.visit(activity.prev_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!activity?.next_page_url}
                                    onClick={() => {
                                        if (activity?.next_page_url) router.visit(activity.next_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Berikutnya')}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3 overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Waktu')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Action')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Pesan')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityRows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        activityRows.map((r) => (
                                            <tr key={r.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">{r.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{r.action || '-'}</td>
                                                <td className="px-4 py-3">{r.message || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{r.ip ?? '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm font-semibold">{t('Pesanan')}</div>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">{t('Data')}</div>
                                <Select
                                    value={String(ordersPerPage)}
                                    onValueChange={(v) => {
                                        const next = Number(v);
                                        setOrdersPerPage(next);
                                        applyFilters({ orders_per_page: next, orders_page: 1 });
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-24">
                                        <SelectValue placeholder={t('Pilih')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[25, 50, 100, 200].map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!orders?.prev_page_url}
                                    onClick={() => {
                                        if (orders?.prev_page_url) router.visit(orders.prev_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!orders?.next_page_url}
                                    onClick={() => {
                                        if (orders?.next_page_url) router.visit(orders.next_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Berikutnya')}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3 overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('ID')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dibuat')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Layanan')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Status')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Aksi')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderRows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        orderRows.map((o) => (
                                            <tr key={o.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">#{o.id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{o.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3">{o.service_name || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(o.total_price ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{o.status || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/orders/${o.id}`} prefetch>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm font-semibold">{t('Deposit')}</div>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">{t('Data')}</div>
                                <Select
                                    value={String(depositsPerPage)}
                                    onValueChange={(v) => {
                                        const next = Number(v);
                                        setDepositsPerPage(next);
                                        applyFilters({ deposits_per_page: next, deposits_page: 1 });
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-24">
                                        <SelectValue placeholder={t('Pilih')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[25, 50, 100, 200].map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!deposits?.prev_page_url}
                                    onClick={() => {
                                        if (deposits?.prev_page_url) router.visit(deposits.prev_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!deposits?.next_page_url}
                                    onClick={() => {
                                        if (deposits?.next_page_url) router.visit(deposits.next_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Berikutnya')}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3 overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('ID')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dibuat')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Jumlah')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Metode')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Status')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Aksi')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {depositRows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        depositRows.map((d) => (
                                            <tr key={d.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">#{d.id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{d.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(d.amount ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{d.tripay_method || d.payment_method || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{d.status || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/deposits/${d.id}`} prefetch>
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
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminUserDetail.layout = {
    breadcrumbs: [
        { title: 'Pengguna', href: '/users' },
        { title: 'Detail', href: '#' },
    ],
};
