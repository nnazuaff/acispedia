import { Head, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/i18n-provider';

type Stats = {
    deposit_success_count: number;
    deposit_success_amount: number;
    deposit_pending_count: number;
    order_total_count: number;
    order_success_count: number;
    order_failed_count: number;
    order_total_spent: number;
    total_user_balance: number;
};

type Filters = {
    date_from: string;
    date_to: string;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminFinancialReport() {
    const { t } = useI18n();
    const { stats, filters } = usePage().props as any as {
        stats: Stats;
        filters: Filters;
    };

    const [dateFrom, setDateFrom] = React.useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = React.useState(filters?.date_to ?? '');

    React.useEffect(() => {
        setDateFrom(filters?.date_from ?? '');
        setDateTo(filters?.date_to ?? '');
    }, [filters?.date_from, filters?.date_to]);

    function applyFilters() {
        router.get(
            '/financial-report',
            { date_from: dateFrom, date_to: dateTo } as any,
            { preserveScroll: true, preserveState: true, replace: true }
        );
    }

    return (
        <>
            <Head title={t('Laporan Keuangan')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Laporan Keuangan')} description={t('Ringkasan deposit dan pesanan.')} />

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div>
                                <Label htmlFor="date_from">{t('Dari Tanggal')}</Label>
                                <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="date_to">{t('Sampai Tanggal')}</Label>
                                <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={applyFilters}>{t('Terapkan')}</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Deposit Sukses (Jumlah)')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.deposit_success_count ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Deposit Sukses (Nominal)')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(stats?.deposit_success_amount ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Deposit Pending')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.deposit_pending_count ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Saldo User')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(stats?.total_user_balance ?? 0)}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Pesanan')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.order_total_count ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Pesanan Sukses')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.order_success_count ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Pesanan Gagal')}</div>
                            <div className="mt-2 text-2xl font-semibold">{formatNumber(stats?.order_failed_count ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Spent')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(stats?.order_total_spent ?? 0)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminFinancialReport.layout = {
    breadcrumbs: [
        {
            title: 'Laporan Keuangan',
            href: '/financial-report',
        },
    ],
};
