import { Head, Link, router, usePage } from '@inertiajs/react';
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

type LogRow = {
    id: number;
    action: string;
    message: string;
    ip: string | null;
    created_at_wib: string | null;
    user: {
        id: number;
        name: string | null;
        email: string | null;
    };
};

type LogsPaginator = {
    data: LogRow[];
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
    q?: string | null;
    user_id?: number | null;
    per_page: number;
};

export default function AdminUserActivityLogs() {
    const { t } = useI18n();
    const { logs, filters } = usePage().props as any as {
        logs: LogsPaginator;
        filters: Filters;
    };

    const rows = Array.isArray(logs?.data) ? logs.data : [];

    const [perPage, setPerPage] = React.useState<number>(Number(filters?.per_page ?? 25));
    const [userId, setUserId] = React.useState<string>(filters?.user_id ? String(filters.user_id) : '');
    const [q, setQ] = React.useState<string>(String(filters?.q ?? ''));

    React.useEffect(() => {
        setPerPage(Number(filters?.per_page ?? 25));
    }, [filters?.per_page]);

    React.useEffect(() => {
        setUserId(filters?.user_id ? String(filters.user_id) : '');
    }, [filters?.user_id]);

    React.useEffect(() => {
        setQ(String(filters?.q ?? ''));
    }, [filters?.q]);

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const normalizedUserId = userId.trim() === '' ? undefined : Number(userId);

        router.get(
            '/user-activity-logs',
            {
                per_page: perPage,
                user_id: Number.isFinite(normalizedUserId as any) ? (normalizedUserId as any) : undefined,
                q: q.trim() !== '' ? q.trim() : undefined,
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
            <Head title={t('Log Aktivitas User')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Log Aktivitas User')} description={t('Gabungan aktivitas semua user.')} />

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="text-sm font-semibold">{t('Aktivitas')}</div>
                                <div className="mt-1 grid gap-2 md:grid-cols-2">
                                    <div className="grid gap-1">
                                        <Label htmlFor="user_id" className="text-xs text-muted-foreground">
                                            {t('User ID')}
                                        </Label>
                                        <Input
                                            id="user_id"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            inputMode="numeric"
                                            placeholder="123"
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="q" className="text-xs text-muted-foreground">
                                            {t('Kata kunci')}
                                        </Label>
                                        <Input
                                            id="q"
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            placeholder={t('contoh: login / order / email')}
                                            className="h-9"
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Button type="button" size="sm" onClick={() => applyFilters({ page: 1 })}>
                                        {t('Terapkan')}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setUserId('');
                                            setQ('');
                                            router.get('/user-activity-logs', { per_page: perPage, page: 1 } as any, {
                                                preserveScroll: true,
                                                preserveState: true,
                                                replace: true,
                                            });
                                        }}
                                    >
                                        {t('Reset')}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">{t('Data')}</div>
                                <Select
                                    value={String(perPage)}
                                    onValueChange={(v) => {
                                        const next = Number(v);
                                        setPerPage(next);
                                        applyFilters({ per_page: next, page: 1 });
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
                                    disabled={!logs?.prev_page_url}
                                    onClick={() => {
                                        if (logs?.prev_page_url) router.visit(logs.prev_page_url, { preserveScroll: true });
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!logs?.next_page_url}
                                    onClick={() => {
                                        if (logs?.next_page_url) router.visit(logs.next_page_url, { preserveScroll: true });
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('User')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Action')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Pesan')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('IP')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((r) => (
                                            <tr key={r.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">{r.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <Link href={`/users/${r.user?.id ?? 0}`} className="font-medium hover:underline" prefetch>
                                                            {r.user?.name ?? '-'}
                                                        </Link>
                                                        <div className="text-xs text-muted-foreground">{r.user?.email ?? ''}</div>
                                                    </div>
                                                </td>
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
            </div>
        </>
    );
}

AdminUserActivityLogs.layout = {
    breadcrumbs: [{ title: 'Log Aktivitas User', href: '/user-activity-logs' }],
};
