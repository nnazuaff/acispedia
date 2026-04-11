import { Form, Head, Link, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminUserDetail() {
    const { t } = useI18n();

    const { user, latest_orders, latest_deposits, ledger } = usePage().props as any as {
        user: UserDetail;
        latest_orders: OrderRow[];
        latest_deposits: DepositRow[];
        ledger: LedgerRow[];
    };

    const orders = Array.isArray(latest_orders) ? latest_orders : [];
    const deposits = Array.isArray(latest_deposits) ? latest_deposits : [];
    const ledgerRows = Array.isArray(ledger) ? ledger : [];

    const [mode, setMode] = React.useState<'add' | 'subtract' | 'set'>('add');

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
                        <div className="text-sm font-semibold">{t('Atur Saldo')}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {t('Admin dapat menambah, mengurangi, atau set saldo user secara manual (akan tercatat di log aktivitas admin).')}
                        </div>

                        <Form action={`/users/${user.id}/balance`} method="post" className="mt-4 grid gap-3 md:max-w-md">
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
                        <div className="overflow-x-auto rounded-lg border">
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
                        <div className="text-sm font-semibold">{t('Pesanan Terbaru')}</div>
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
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((o) => (
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
                        <div className="text-sm font-semibold">{t('Deposit Terbaru')}</div>
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
                                    {deposits.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        deposits.map((d) => (
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
