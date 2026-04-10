import { Head, router, usePage } from '@inertiajs/react';
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
    entity_type: string | null;
    entity_id: string | null;
    message: string;
    ip: string | null;
    created_at_wib: string | null;
    admin_user: {
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
    q: string;
    action: string;
    per_page: number;
};

export default function AdminActivityLogs() {
    const { t } = useI18n();
    const { logs, filters, known_actions } = usePage().props as any as {
        logs: LogsPaginator;
        filters: Filters;
        known_actions: string[];
    };

    const [q, setQ] = React.useState(filters?.q ?? '');
    const [action, setAction] = React.useState(filters?.action ?? '');
    const [perPage, setPerPage] = React.useState<number>(Number(filters?.per_page ?? 25));

    React.useEffect(() => {
        setQ(filters?.q ?? '');
        setAction(filters?.action ?? '');
        setPerPage(Number(filters?.per_page ?? 25));
    }, [filters?.q, filters?.action, filters?.per_page]);

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const merged = {
            q,
            action,
            per_page: perPage,
            ...(next ?? {}),
        };

        router.get('/activity-logs', merged as any, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function resetFilters() {
        setQ('');
        setAction('');
        setPerPage(25);
        router.get(
            '/activity-logs',
            { q: '', action: '', per_page: 25 } as any,
            { preserveScroll: true, preserveState: true, replace: true }
        );
    }

    const rows = Array.isArray(logs?.data) ? logs.data : [];

    return (
        <>
            <Head title={t('Log Aktivitas')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Log Aktivitas')} description={t('Riwayat aktivitas di area admin.')} />

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <Label htmlFor="q">{t('Cari')}</Label>
                                <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('pesan / entity / admin')} />
                            </div>

                            <div className="lg:col-span-2">
                                <Label>{t('Action')}</Label>
                                <Select value={action || 'all'} onValueChange={(v) => setAction(v === 'all' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Semua')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('Semua')}</SelectItem>
                                        {(known_actions ?? []).map((a) => (
                                            <SelectItem key={a} value={a}>
                                                {a}
                                            </SelectItem>
                                        ))}
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dibuat')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Admin')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Action')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Entity')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Pesan')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('IP')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">{row.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.admin_user?.name || row.admin_user?.email || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.action || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.entity_type ? `${row.entity_type}:${row.entity_id ?? '-'}` : '-'}</td>
                                                <td className="px-4 py-3">{row.message || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.ip ?? '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                {t('Menampilkan')} {logs?.from ?? 0}–{logs?.to ?? rows.length} {t('dari')} {logs?.total ?? rows.length}
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!logs?.prev_page_url}
                                    onClick={() => {
                                        if (logs?.prev_page_url) router.visit(logs.prev_page_url);
                                    }}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!logs?.next_page_url}
                                    onClick={() => {
                                        if (logs?.next_page_url) router.visit(logs.next_page_url);
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

AdminActivityLogs.layout = {
    breadcrumbs: [
        {
            title: 'Log Aktivitas',
            href: '/activity-logs',
        },
    ],
};
