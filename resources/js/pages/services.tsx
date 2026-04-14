import { Head } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Spinner } from '@/components/ui/spinner';

type Service = {
    id: number;
    name: string;
    category: string;
    description: string;
    price: number;
    price_formatted?: string;
    min: number;
    max: number;
    average_time: string | null;
};

type ServicesPayload = {
    success: boolean;
    message?: string;
    services?: Record<string, Service[]> | Service[];
    categories?: Record<string, string> | string[];
    valid_services?: number;
    shown_services?: number;
    page?: number;
    per_page?: number;
    total_pages?: number;
};

type ServiceGroup = {
    key: string;
    label: string;
    services: Service[];
};

function b64ToUtf8(b64: string): string {
    const bin = atob(b64);

    if (window.TextDecoder) {
        const bytes = new Uint8Array(bin.length);

        for (let i = 0; i < bin.length; i++) {
            bytes[i] = bin.charCodeAt(i);
        }

        return new TextDecoder('utf-8').decode(bytes);
    }

    let esc = '';

    for (let i = 0; i < bin.length; i++) {
        const hex = bin.charCodeAt(i).toString(16).padStart(2, '0');
        esc += `%${hex}`;
    }

    return decodeURIComponent(esc);
}

function unpackApiPayload(obj: unknown): ServicesPayload {
    if (!obj || typeof obj !== 'object') {
        return { success: false, message: 'Response tidak valid.' };
    }

    const maybe = obj as { encoding?: unknown; payload?: unknown };

    if (maybe.encoding !== 'b64json' || typeof maybe.payload !== 'string') {
        return obj as ServicesPayload;
    }

    try {
        const jsonText = b64ToUtf8(maybe.payload);
        const parsed = JSON.parse(jsonText);

        return parsed as ServicesPayload;
    } catch {
        return { success: false, message: 'Gagal membuka payload layanan.' };
    }
}

function normalizeServiceGroups(services: ServicesPayload['services']): ServiceGroup[] {
    if (!services) {
        return [];
    }

    if (Array.isArray(services)) {
        if (services.length === 0) {
            return [];
        }

        return [
            {
                key: 'results',
                label: services[0]?.category ?? 'Layanan',
                services,
            },
        ];
    }

    return Object.entries(services)
        .map(([key, list]) => ({
            key,
            label: Array.isArray(list) && list[0]?.category ? list[0].category : key,
            services: Array.isArray(list) ? list : [],
        }))
        .filter((group) => group.services.length > 0);
}

function normalizeCategories(categories: ServicesPayload['categories']): string[] {
    if (!categories) {
        return [];
    }

    if (Array.isArray(categories)) {
        return categories;
    }

    return Object.values(categories);
}

function normalizeDescription(input: string): string {
    return input
        .replace(/\r\n/g, '\n')
        .replace(/<\s*br\s*\/?>/gi, '\n')
        .replace(/<\s*\/\s*p\s*>/gi, '\n')
        .replace(/<\s*p[^>]*>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
}

const ALL_CATEGORIES_VALUE = '__all__';
const DEFAULT_SORT_VALUE = '__default__';

const sortOptions = [
    { value: DEFAULT_SORT_VALUE, label: 'Default' },
    { value: 'time_asc', label: 'Waktu: Tercepat' },
    { value: 'price_asc', label: 'Harga: Termurah' },
    { value: 'price_desc', label: 'Harga: Termahal' },
    { value: 'name_asc', label: 'Nama: A-Z' },
    { value: 'name_desc', label: 'Nama: Z-A' },
] as const;

type SortValue = (typeof sortOptions)[number]['value'];

const perPageOptions = ['25', '50', '100', '200'] as const;
type PerPageValue = (typeof perPageOptions)[number];

export default function Services() {
    const { t, locale } = useI18n();

    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [serviceQuery, setServiceQuery] = React.useState('');
    const [debouncedServiceQuery, setDebouncedServiceQuery] = React.useState('');
    const [categoryQuery, setCategoryQuery] = React.useState('');
    const [category, setCategory] = React.useState<string>(ALL_CATEGORIES_VALUE);
    const [sort, setSort] = React.useState<SortValue>(DEFAULT_SORT_VALUE);
    const [perPage, setPerPage] = React.useState<PerPageValue>('25');
    const [page, setPage] = React.useState(1);

    const [categories, setCategories] = React.useState<string[]>([]);
    const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([]);

    const [meta, setMeta] = React.useState({
        valid: 0,
        shown: 0,
        totalPages: 0,
    });

    const [detail, setDetail] = React.useState<Service | null>(null);

    const load = React.useCallback(
        async (opts: { q?: string; category?: string; sort?: string; perPage?: string; page?: number }) => {
            setIsLoading(true);
            setError(null);

            try {
                const url = new URL('/api/services', window.location.origin);
                url.searchParams.set('obf', '1');
                url.searchParams.set('per_page', opts.perPage ?? '25');

                if (opts.q) {
                    url.searchParams.set('q', opts.q);
                }

                if (opts.category && opts.category !== ALL_CATEGORIES_VALUE) {
                    url.searchParams.set('category', opts.category);
                }

                if (opts.sort && opts.sort !== DEFAULT_SORT_VALUE) {
                    url.searchParams.set('sort', opts.sort);
                }

                if (opts.page) {
                    url.searchParams.set('page', String(opts.page));
                }

                const res = await fetch(url.toString(), {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                const raw = (await res.json()) as unknown;
                const json = unpackApiPayload(raw);

                if (!json.success) {
                    setError(t(json.message ?? 'Gagal memuat layanan.'));
                    setServiceGroups([]);
                    setCategories([]);
                    setMeta({ valid: 0, shown: 0, totalPages: 0 });
                    return;
                }

                const nextServiceGroups = normalizeServiceGroups(json.services);
                const nextCategories = normalizeCategories(json.categories);

                setServiceGroups(nextServiceGroups);
                setCategories(nextCategories);

                setMeta({
                    valid: json.valid_services ?? nextServiceGroups.reduce((sum, group) => sum + group.services.length, 0),
                    shown: json.shown_services ?? nextServiceGroups.reduce((sum, group) => sum + group.services.length, 0),
                    totalPages: json.total_pages ?? 0,
                });
            } catch (e) {
                const msg = e instanceof Error ? e.message : t('Kesalahan tidak diketahui.');
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        },
        [t]
    );

    React.useEffect(() => {
        const id = window.setTimeout(() => {
            setDebouncedServiceQuery(serviceQuery);
            setPage(1);
        }, 350);

        return () => window.clearTimeout(id);
    }, [serviceQuery]);

    React.useEffect(() => {
        if (category === ALL_CATEGORIES_VALUE) {
            return;
        }

        if (categories.includes(category)) {
            return;
        }

        setCategory(ALL_CATEGORIES_VALUE);
        setPage(1);
    }, [categories, category]);

    React.useEffect(() => {
        load({ q: debouncedServiceQuery, category, sort, perPage, page });
    }, [load, debouncedServiceQuery, category, sort, perPage, page]);

    const filteredCategories = React.useMemo(() => {
        const keyword = categoryQuery.trim().toLowerCase();

        if (keyword === '') {
            return categories;
        }

        return categories.filter((item) => item.toLowerCase().includes(keyword));
    }, [categories, categoryQuery]);

    return (
        <>
            <Head title={t('Layanan')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <Heading
                        variant="small"
                        title={t('Layanan')}
                        description={t('Cari dan lihat daftar layanan.')}
                    />
                </div>

                <Card className="py-4">
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-12">
                            <div className="md:col-span-4">
                                <Label htmlFor="service-q">{t('Cari layanan')}</Label>
                                <Input
                                    id="service-q"
                                    className="mt-1"
                                    value={serviceQuery}
                                    onChange={(e) => setServiceQuery(e.target.value)}
                                    placeholder={t('Cari nama layanan...')}
                                />
                            </div>

                            <div className="md:col-span-4">
                                <Label htmlFor="sort">{t('Urutkan')}</Label>
                                <Select
                                    value={sort}
                                    onValueChange={(v) => {
                                        setSort(v as SortValue);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger id="sort" className="mt-1 w-full">
                                        <SelectValue placeholder={t('Default')} />
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        {sortOptions.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>
                                                {t(o.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-4">
                                <Label htmlFor="category-q">{t('Cari kategori')}</Label>
                                <Input
                                    id="category-q"
                                    className="mt-1"
                                    value={categoryQuery}
                                    onChange={(e) => setCategoryQuery(e.target.value)}
                                    placeholder={t('Cari kategori...')}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 rounded-lg border border-dashed p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{t('Kategori')}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {locale === 'en'
                                            ? 'Click a category to limit the visible services.'
                                            : 'Klik kategori untuk menampilkan layanan pada kategori itu saja.'}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {locale === 'en'
                                        ? `${filteredCategories.length} categories`
                                        : `${filteredCategories.length} kategori`}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className={[
                                        'rounded-full border px-3 py-1.5 text-sm transition-colors',
                                        category === ALL_CATEGORIES_VALUE
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                                    ].join(' ')}
                                    onClick={() => {
                                        setCategory(ALL_CATEGORIES_VALUE);
                                        setPage(1);
                                    }}
                                >
                                    {t('Semua kategori')}
                                </button>

                                {filteredCategories.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={[
                                            'rounded-full border px-3 py-1.5 text-sm transition-colors',
                                            category === item
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                                        ].join(' ')}
                                        onClick={() => {
                                            setCategory(item);
                                            setPage(1);
                                        }}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>

                            {!isLoading && filteredCategories.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                    {t('Tidak ada kategori yang cocok dengan pencarian.')}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Spinner className="size-4" />
                                        <span>{t('Memuat layanan...')}</span>
                                    </>
                                ) : error ? (
                                    <span className="text-destructive">{error}</span>
                                ) : (
                                    <span>
                                        {locale === 'en'
                                            ? `Showing ${meta.shown} of ${meta.valid} services${meta.totalPages > 0 ? ` (Page ${page} / ${meta.totalPages})` : ''}`
                                            : `Menampilkan ${meta.shown} dari ${meta.valid} layanan${meta.totalPages > 0 ? ` (Halaman ${page} / ${meta.totalPages})` : ''}`}
                                    </span>
                                )}
                            </div>

                            {!isLoading && !error && (
                                <div>
                                    {locale === 'en'
                                        ? `Active category: ${category === ALL_CATEGORIES_VALUE ? 'All categories' : category}`
                                        : `Kategori aktif: ${category === ALL_CATEGORIES_VALUE ? 'Semua kategori' : category}`}
                                </div>
                            )}
                        </div>

                        <div className="overflow-hidden rounded-lg border">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/30">
                                        <tr className="text-left">
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                ID
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Layanan')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Harga/K')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Min')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Maks')}
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Waktu')}
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('Aksi')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceGroups.map((group) => (
                                            <React.Fragment key={group.key}>
                                                <tr className="border-t bg-sky-100/70 text-slate-900">
                                                    <td colSpan={7} className="px-4 py-3 text-center font-semibold">
                                                        {group.label}
                                                    </td>
                                                </tr>

                                                {group.services.map((s) => (
                                                    <tr key={s.id} className="border-t transition-colors hover:bg-muted/20">
                                                        <td className="px-4 py-3 align-top font-medium">{s.id}</td>
                                                        <td className="px-4 py-3 align-top">
                                                            <div className="font-semibold text-foreground">{s.name}</div>
                                                        </td>
                                                        <td className="px-4 py-3 align-top font-semibold text-emerald-600 dark:text-emerald-500">
                                                            {s.price_formatted ?? '—'}
                                                        </td>
                                                        <td className="px-4 py-3 align-top">{s.min}</td>
                                                        <td className="px-4 py-3 align-top">{s.max}</td>
                                                        <td className="px-4 py-3 align-top">{s.average_time ?? ''}</td>
                                                        <td className="px-4 py-3 align-top">
                                                            <div className="flex flex-wrap justify-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    onClick={() => {
                                                                        try {
                                                                            window.sessionStorage.setItem(
                                                                                'order_preselect_service_id',
                                                                                String(s.id)
                                                                            );
                                                                            window.sessionStorage.setItem(
                                                                                'order_preselect_service_flash',
                                                                                '1'
                                                                            );

                                                                            window.location.href = '/order';
                                                                        } catch {
                                                                            window.location.href = `/order?service_id=${encodeURIComponent(
                                                                                String(s.id)
                                                                            )}`;
                                                                        }
                                                                    }}
                                                                >
                                                                    {t('Beli')}
                                                                </Button>
                                                                <Button type="button" onClick={() => setDetail(s)}>
                                                                    {t('Detail')}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}

                                        {!isLoading && serviceGroups.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                                                >
                                                    {t('Tidak ada layanan untuk filter saat ini.')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                            <div className="text-xs text-muted-foreground">
                                {meta.totalPages > 1
                                    ? locale === 'en'
                                        ? `Page ${page} / ${meta.totalPages}`
                                        : `Halaman ${page} / ${meta.totalPages}`
                                    : ' '}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {meta.totalPages > 1 && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        >
                                            {t('Sebelumnya')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={meta.totalPages > 0 && page >= meta.totalPages}
                                            onClick={() =>
                                                setPage((p) =>
                                                    meta.totalPages > 0
                                                        ? Math.min(meta.totalPages, p + 1)
                                                        : p + 1
                                                )
                                            }
                                        >
                                            {t('Berikutnya')}
                                        </Button>
                                    </>
                                )}

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{t('Data')}:</span>
                                    <Select
                                        value={perPage}
                                        onValueChange={(v) => {
                                            setPerPage(v as PerPageValue);
                                            setPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            {perPageOptions.map((v) => (
                                                <SelectItem key={v} value={v}>
                                                    {v}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
                    <DialogContent>
                        {detail && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>{t('Detail Layanan')}</DialogTitle>
                                    <DialogDescription>
                                        ID {detail.id} • {detail.category}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-3 text-sm">
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground">{t('Nama')}</div>
                                        <div className="mt-1 font-medium">{detail.name}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs font-semibold text-muted-foreground">
                                                {t('Harga/K')}
                                            </div>
                                            <div className="mt-1 font-semibold text-emerald-600 dark:text-emerald-500">
                                                {detail.price_formatted ?? '—'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-muted-foreground">
                                                {t('Waktu')}
                                            </div>
                                            <div className="mt-1 font-medium">{detail.average_time ?? '—'}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs font-semibold text-muted-foreground">{t('Min')}</div>
                                            <div className="mt-1 font-medium">{detail.min}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-muted-foreground">{t('Maks')}</div>
                                            <div className="mt-1 font-medium">{detail.max}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground">
                                            {t('Deskripsi')}
                                        </div>
                                        <div className="mt-1 whitespace-pre-wrap wrap-break-word text-muted-foreground">
                                            {normalizeDescription(detail.description)}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDetail(null)}>
                                        {t('Tutup')}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Services.layout = {
    breadcrumbs: [
        {
            title: 'Layanan',
            href: '/services',
        },
    ],
};
