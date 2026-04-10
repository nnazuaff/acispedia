import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/i18n-provider';

function orderStatusMeta(status: string | null, t: (key: string) => string): { label: string; className: string } {
    const key = String(status ?? '').toLowerCase();
    if (key === 'success') return { label: t('Sukses'), className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
    if (key === 'pending') return { label: t('Pending'), className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
    if (key === 'processing' || key === 'submitting') return { label: t('Proses'), className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300' };
    if (key === 'partial') return { label: t('Partial'), className: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300' };
    if (key === 'failed' || key === 'error') return { label: t('Gagal'), className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300' };
    if (key === 'canceled' || key === 'cancelled') return { label: t('Canceled'), className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
    return { label: status ?? '-', className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
}

type AdminDashboardStats = {
    users_today: number;
    orders_today: number;
    deposit_success_count_today: number;
    deposit_success_sum_today: number;
};

type RecentOrderRow = {
    id: number;
    created_at: string | null;
    service_name: string | null;
    quantity: number | null;
    total_price: number | null;
    status: string | null;
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
};

export default function AdminDashboard({
    stats,
    recentOrders,
}: {
    stats: AdminDashboardStats;
    recentOrders: RecentOrderRow[];
}) {
    const { t } = useI18n();

    const fmt = (value: number) => new Intl.NumberFormat('id-ID').format(value);

    return (
        <>
            <Head title={t('Dashboard Admin')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Dashboard Admin')}
                    description={t('Ringkasan aktivitas hari ini')}
                />

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-sky-500/30 bg-sky-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Pengguna Baru Hari Ini')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {fmt(stats.users_today ?? 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sky-500/30 bg-sky-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Pesanan Hari Ini')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {fmt(stats.orders_today ?? 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Deposit Berhasil Hari Ini')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {fmt(stats.deposit_success_count_today ?? 0)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                Rp {fmt(stats.deposit_success_sum_today ?? 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t('Saldo masuk')}
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                Rp {fmt(stats.deposit_success_sum_today ?? 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm font-semibold">
                            {t('Pesanan Hari Ini')}
                        </div>

                        <div className="mt-3 overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('ID')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Tanggal')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Pengguna')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Layanan')}
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td
                                                className="px-4 py-6 text-center text-muted-foreground"
                                                colSpan={7}
                                            >
                                                {t('Belum ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((row) => (
                                            <tr key={row.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    #{row.id}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.created_at ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.user?.name || row.user?.email || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {row.service_name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {fmt(Number(row.quantity ?? 0))}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    Rp {fmt(Number(row.total_price ?? 0))}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {(() => {
                                                        const meta = orderStatusMeta(row.status, t);
                                                        return (
                                                            <Badge variant="outline" className={meta.className}>
                                                                {meta.label}
                                                            </Badge>
                                                        );
                                                    })()}
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

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Admin',
            href: '/dashboard',
        },
    ],
};
