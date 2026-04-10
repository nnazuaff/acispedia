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

type ServiceRow = {
    code: string;
    name: string;
    category: string;
    min: number;
    max: number;
    price: number;
    status: string;
};

type ServicesPayload = {
    data: ServiceRow[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

type Filters = {
    q: string;
    category: string;
    per_page: number;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminServices() {
    const { t } = useI18n();
    const { services, filters, categories, error } = usePage().props as any as {
        services: ServicesPayload;
        filters: Filters;
        categories: string[];
        error: string | null;
    };

    const rows = Array.isArray(services?.data) ? services.data : [];
    const meta = services?.meta ?? { total: rows.length, per_page: 25, current_page: 1, last_page: 1 };

    const [q, setQ] = React.useState(filters?.q ?? '');
    const [category, setCategory] = React.useState(filters?.category ?? '');
    const [perPage, setPerPage] = React.useState<number>(Number(filters?.per_page ?? 25));

    React.useEffect(() => {
        setQ(filters?.q ?? '');
        setCategory(filters?.category ?? '');
        setPerPage(Number(filters?.per_page ?? 25));
    }, [filters?.q, filters?.category, filters?.per_page]);

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const merged = {
            q,
            category,
            per_page: perPage,
            ...(next ?? {}),
        };

        router.get('/services', merged as any, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function resetFilters() {
        setQ('');
        setCategory('');
        setPerPage(25);

        router.get(
            '/services',
            { q: '', category: '', per_page: 25 } as any,
            { preserveScroll: true, preserveState: true, replace: true }
        );
    }

    const canPrev = Number(meta?.current_page ?? 1) > 1;
    const canNext = Number(meta?.current_page ?? 1) < Number(meta?.last_page ?? 1);

    return (
        <>
            <Head title={t('Layanan')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Layanan')} description={t('Manajemen layanan admin.')} />

                {error ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-destructive">{error}</div>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <Label htmlFor="q">{t('Cari')}</Label>
                                <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('nama / kategori / kode')} />
                            </div>

                            <div className="lg:col-span-2">
                                <Label>{t('Kategori')}</Label>
                                <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Semua')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('Semua')}</SelectItem>
                                        {(categories ?? []).map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Kode')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Nama')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Kategori')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Min')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Max')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Harga')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.code} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">{row.code || '-'}</td>
                                                <td className="px-4 py-3">{row.name || '-'}</td>
                                                <td className="px-4 py-3">{row.category || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{formatNumber(Number(row.min ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{formatNumber(Number(row.max ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(Number(row.price ?? 0))}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.status || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                {t('Total')}: {formatNumber(Number(meta?.total ?? rows.length))}
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button variant="outline" disabled={!canPrev} onClick={() => applyFilters({ page: Number(meta.current_page ?? 1) - 1 })}>
                                    {t('Sebelumnya')}
                                </Button>
                                <Button variant="outline" disabled={!canNext} onClick={() => applyFilters({ page: Number(meta.current_page ?? 1) + 1 })}>
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

AdminServices.layout = {
    breadcrumbs: [
        {
            title: 'Layanan',
            href: '/services',
        },
    ],
};
