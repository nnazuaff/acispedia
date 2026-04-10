import { Head, Link, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Clock,
    CreditCard,
    History,
    Layers,
    PlusCircle,
    TrendingDown,
    Wallet,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';
import { dashboard } from '@/routes';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function Dashboard() {
    const { t } = useI18n();
    const { auth, stats: statsProp } = usePage().props as any;

    const userName = auth.user?.name ?? t('Pengguna');

    const initialStats =
        statsProp && typeof statsProp === 'object'
            ? {
                  balance: Number(statsProp.balance ?? 0),
                  totalMonth: Number(statsProp.totalMonth ?? 0),
                  active: Number(statsProp.active ?? 0),
                  completed: Number(statsProp.completed ?? 0),
                  totalSpent: Number(statsProp.totalSpent ?? 0),
              }
            : { balance: 0, totalMonth: 0, active: 0, completed: 0, totalSpent: 0 };

    const [stats, setStats] = React.useState(initialStats);

    React.useEffect(() => {
        setStats(initialStats);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statsProp?.balance, statsProp?.totalMonth, statsProp?.active, statsProp?.completed, statsProp?.totalSpent]);

    React.useEffect(() => {
        const uid = Number(auth.user?.id);

        if (!Number.isFinite(uid) || uid <= 0) {
            return;
        }

        const echo = (window as any)?.Echo;

        if (!echo) {
            return;
        }

        const channelName = `dashboard.${uid}`;
        const channel = echo.private(channelName);

        channel.listen('.dashboard.stats.updated', (payload: any) => {
            const next = payload?.stats;

            if (!next || typeof next !== 'object') {
                return;
            }

            setStats((prev) => ({
                ...prev,
                balance: Number(next.balance ?? prev.balance),
                totalMonth: Number(next.totalMonth ?? prev.totalMonth),
                active: Number(next.active ?? prev.active),
                completed: Number(next.completed ?? prev.completed),
                totalSpent: Number(next.totalSpent ?? prev.totalSpent),
            }));
        });

        return () => {
            try {
                echo.leave(channelName);
            } catch {
                // ignore
            }
        };
    }, [auth.user?.id]);

    return (
        <>
            <Head title={t('Dashboard')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Welcome */}
                <div className="rounded-xl bg-linear-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-sm">
                    <div className="text-xl font-semibold">
                        {t('Selamat Datang')}, {userName}!
                    </div>
                    <p className="mt-1 text-sm text-primary-foreground/90">
                        {t('Kelola pesanan dan pantau aktivitas Anda dari dashboard ini.')}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <Card className="py-4">
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                                {t('Saldo Anda')}
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Wallet className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                Rp {formatRupiah(stats.balance)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {t('Saldo tersedia')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-4">
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                                {t('Total Pesanan')}
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-500">
                                <ClipboardList className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {formatRupiah(stats.totalMonth)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {t('Pesanan bulan ini')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-4">
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                                {t('Pesanan Aktif')}
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-500">
                                <Clock className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {formatRupiah(stats.active)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {t('Sedang diproses')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-4">
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                                {t('Pesanan Selesai')}
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-500">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {formatRupiah(stats.completed)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {t('Berhasil diselesaikan')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-4">
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                                {t('Total Pengeluaran')}
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                <TrendingDown className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                Rp {formatRupiah(stats.totalSpent)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {t('Total yang dibelanjakan')}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick actions */}
                <Card className="py-4">
                    <CardHeader>
                        <div className="text-base font-semibold">{t('Aksi Cepat')}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-auto flex-col gap-2 py-4"
                                asChild
                            >
                                <Link href="/order" prefetch>
                                    <PlusCircle className="size-6" />
                                    {t('Buat Pesanan')}
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-auto flex-col gap-2 py-4"
                                asChild
                            >
                                <Link href="/services" prefetch>
                                    <Layers className="size-6" />
                                    {t('Lihat Layanan')}
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-auto flex-col gap-2 py-4"
                                asChild
                            >
                                <Link href="/deposit" prefetch>
                                    <CreditCard className="size-6" />
                                    {t('Isi Saldo')}
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-auto flex-col gap-2 py-4"
                                asChild
                            >
                                <Link href="/history/transaction" prefetch>
                                    <History className="size-6" />
                                    {t('Riwayat')}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
