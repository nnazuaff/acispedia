import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useConfirm } from '@/components/confirm-dialog-provider';
import { useI18n } from '@/i18n/i18n-provider';

type UserRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    account_status: string;
    last_activity_at_wib?: string | null;
    balance: number;
    total_spent: number;
    total_deposit: number;
    is_admin_protected: boolean;
};

type UsersPaginator = {
    data: UserRow[];
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
    id: string;
    status: string;
    per_page: number;
};

type Stats = {
    total_users: number;
    total_balance: number;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function statusMeta(status: string, t: (key: string) => string): { label: string; className: string } {
    const key = String(status ?? '').toLowerCase();
    if (key === 'active' || key === '') {
        return { label: t('Aktif'), className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
    }
    if (key === 'inactive') {
        return { label: t('Nonaktif'), className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
    }
    if (key === 'banned') {
        return { label: t('Banned'), className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300' };
    }

    return { label: status || '-', className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
}

export default function AdminUsers() {
    const { t } = useI18n();
    const confirm = useConfirm();
    const { users, stats, filters } = usePage().props as any as {
        users: UsersPaginator;
        stats: Stats;
        filters: Filters;
    };

    const STATUS_ALL = 'all';

    const [q, setQ] = React.useState(filters?.q ?? '');
    const [id, setId] = React.useState(filters?.id ?? '');
    const [status, setStatus] = React.useState<string>(filters?.status ? filters.status : STATUS_ALL);
    const [perPage, setPerPage] = React.useState<number>(Number(filters?.per_page ?? 25));

    React.useEffect(() => {
        setQ(filters?.q ?? '');
        setId(filters?.id ?? '');
        setStatus(filters?.status ? filters.status : STATUS_ALL);
        setPerPage(Number(filters?.per_page ?? 25));
    }, [filters?.q, filters?.id, filters?.status, filters?.per_page]);

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const merged = {
            q,
            id,
            status,
            per_page: perPage,
            ...(next ?? {}),
        };

        const payload = {
            ...merged,
            id: String(merged.id ?? '').trim(),
            status: merged.status === STATUS_ALL ? '' : merged.status,
        };

        router.get('/users', payload as any, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function resetFilters() {
        setQ('');
        setId('');
        setStatus(STATUS_ALL);
        setPerPage(25);
        router.get('/users', { q: '', id: '', status: '', per_page: 25 } as any, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    const rows = Array.isArray(users?.data) ? users.data : [];

    async function destroyUser(row: UserRow) {
        if (row.is_admin_protected) return;
        const ok = await confirm({
            title: t('Konfirmasi'),
            description: t('Hapus user ini? Data terkait (order/deposit) ikut terhapus.'),
            variant: 'destructive',
            cancelText: t('Batal'),
            confirmText: t('Ya, hapus'),
        });
        if (!ok) return;

        router.delete(`/users/${row.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={t('Pengguna')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Pengguna')} description={t('Manajemen pengguna admin.')} />

                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href="/users/create" prefetch>
                            {t('Tambah User')}
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Pengguna')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.total_users ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Saldo')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(stats?.total_balance ?? 0)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <Label htmlFor="q">{t('Nama / Email / Telepon Pengguna')}</Label>
                                <Input
                                    id="q"
                                    className="mt-2 h-10"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder=""
                                />
                            </div>

                            <div>
                                <Label htmlFor="id">{t('ID')}</Label>
                                <Input
                                    id="id"
                                    className="mt-2 h-10"
                                    value={id}
                                    onChange={(e) => setId(e.target.value.replace(/\D+/g, ''))}
                                    placeholder=""
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            </div>

                            <div>
                                <Label>{t('Status')}</Label>
                                <Select value={status} onValueChange={(v) => setStatus(v)}>
                                    <SelectTrigger className="mt-2 h-10">
                                        <SelectValue placeholder={t('Semua')} />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value={STATUS_ALL}>{t('Semua')}</SelectItem>
                                        <SelectItem value="active">{t('Aktif')}</SelectItem>
                                        <SelectItem value="inactive">{t('Nonaktif')}</SelectItem>
                                        <SelectItem value="banned">{t('Banned')}</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Nama')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Email')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Telepon')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Saldo')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Deposit')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Spent')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Aktivitas Terakhir')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Status')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Aksi')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={10}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">#{row.id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.name || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.email || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.phone ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(row.balance ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(row.total_deposit ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(row.total_spent ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.last_activity_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {(() => {
                                                        const meta = statusMeta(row.account_status, t);
                                                        return (
                                                            <Badge variant="outline" className={meta.className}>
                                                                {meta.label}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/users/${row.id}`} prefetch>
                                                                {t('Detail')}
                                                            </Link>
                                                        </Button>
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/users/${row.id}/edit`} prefetch>
                                                                {t('Edit')}
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            type="button"
                                                            disabled={row.is_admin_protected}
                                                            onClick={() => destroyUser(row)}
                                                        >
                                                            {t('Hapus')}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                {t('Menampilkan')} {users?.from ?? 0}–{users?.to ?? rows.length} {t('dari')} {users?.total ?? rows.length}
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!users?.prev_page_url}
                                    onClick={() => {
                                        if (users?.prev_page_url) router.visit(users.prev_page_url);
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!users?.next_page_url}
                                    onClick={() => {
                                        if (users?.next_page_url) router.visit(users.next_page_url);
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

AdminUsers.layout = {
    breadcrumbs: [
        {
            title: 'Pengguna',
            href: '/users',
        },
    ],
};
