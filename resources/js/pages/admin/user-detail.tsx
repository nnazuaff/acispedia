import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    account_status: 'active' | 'inactive' | 'banned' | string;
    created_at_wib: string | null;
    updated_at_wib: string | null;
    last_login_at_wib?: string | null;
    last_activity_at_wib?: string | null;
    balance: number;
    total_spent: number;
    total_deposit: number;
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
    ledger_per_page: number;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminUserDetail() {
    const { t } = useI18n();

    const { user, ledger, filters } = usePage().props as any as {
        user: UserDetail;
        ledger: Paginator<LedgerRow>;
        filters: Filters;
    };

    const ledgerRows = Array.isArray(ledger?.data) ? ledger.data : [];

    const [mode, setMode] = React.useState<'add' | 'subtract' | 'set'>('add');
    const [ledgerPerPage, setLedgerPerPage] = React.useState<number>(Number(filters?.ledger_per_page ?? 25));

    React.useEffect(() => {
        setLedgerPerPage(Number(filters?.ledger_per_page ?? 25));
    }, [filters?.ledger_per_page]);

    function renderAccountStatusBadge(status: string) {
        if (status === 'active') {
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                    {t('Aktif')}
                </Badge>
            );
        }

        if (status === 'inactive') {
            return (
                <Badge
                    variant="outline"
                    className="border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                >
                    {t('Nonaktif')}
                </Badge>
            );
        }

        if (status === 'banned') {
            return (
                <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                >
                    {t('Banned')}
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="text-muted-foreground">
                {status || '-'}
            </Badge>
        );
    }

    function applyFilters(next?: Partial<Filters> & { ledger_page?: number }) {
        router.get(
            `/users/${user.id}`,
            {
                ledger_per_page: ledgerPerPage,
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
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline">
                                    <Link href={`/users/${user.id}/edit`} prefetch>
                                        {t('Edit')}
                                    </Link>
                                </Button>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button type="button">{t('Atur Saldo')}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('Atur Saldo')}</DialogTitle>
                                            <DialogDescription>
                                                {t('Admin dapat menambah, mengurangi, atau set saldo user secara manual.')}
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
                                        <td className="px-4 py-3">{t('Status')}</td>
                                        <td className="px-4 py-3">
                                            {renderAccountStatusBadge((user?.account_status ?? 'active') as string)}
                                        </td>
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
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-sm font-semibold">{t('Mutasi Saldo')}</div>
                                <div className="mt-1 text-xs text-muted-foreground">{t('Riwayat perubahan saldo.')}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">{t('Data')}</div>
                                <Select
                                    value={String(ledgerPerPage)}
                                    onValueChange={(v) => {
                                        const next = Number(v);
                                        setLedgerPerPage(next);
                                        applyFilters({ ledger_per_page: next, ledger_page: 1 });
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
                                    disabled={!ledger?.prev_page_url}
                                    onClick={() => {
                                        if (ledger?.prev_page_url) router.visit(ledger.prev_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!ledger?.next_page_url}
                                    onClick={() => {
                                        if (ledger?.next_page_url) router.visit(ledger.next_page_url, { preserveScroll: true });
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
                                                    {r.direction === 'debit' ? (
                                                        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                                                            {t('Debit')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                        >
                                                            {t('Kredit')}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(r.amount ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(r.balance_before ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(r.balance_after ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {r.source_type === 'order' && r.source_id ? (
                                                        <Link href={`/orders/${r.source_id}`} className="font-medium hover:underline" prefetch>
                                                            {t('Order')} #{r.source_id}
                                                        </Link>
                                                    ) : r.source_type === 'deposit' && r.source_id ? (
                                                        <Link href={`/deposits/${r.source_id}`} className="font-medium hover:underline" prefetch>
                                                            {t('Deposit')} #{r.source_id}
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            {r.source_type}
                                                            {r.source_id ? `#${r.source_id}` : ''}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{r.description || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                            {ledger?.from && ledger?.to ? (
                                <>
                                    {t('Menampilkan')} {ledger.from}-{ledger.to} {t('dari')} {ledger.total}
                                </>
                            ) : (
                                <>{t('Menampilkan')} 0 {t('dari')} {ledger?.total ?? 0}</>
                            )}
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
