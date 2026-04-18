import { Head } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';
import {
    AtSign,
    Check,
    ChevronsUpDown,
    Ellipsis,
    Facebook,
    Globe,
    Instagram,
    LayoutGrid,
    Linkedin,
    Music2,
    Search,
    Send,
    Tag,
    Twitter,
    Youtube,
} from 'lucide-react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/utils';

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

type TopCategoryOption = {
    value: string;
    labelKey: string;
    icon: React.ComponentType<{ className?: string }>;
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
const ALL_TOP_CATEGORIES_VALUE = '__all_groups__';
const DEFAULT_SORT_VALUE = '__default__';

const topCategoryOptions: TopCategoryOption[] = [
    { value: ALL_TOP_CATEGORIES_VALUE, labelKey: 'Semua kategori', icon: LayoutGrid },
    { value: 'instagram', labelKey: 'Instagram', icon: Instagram },
    { value: 'facebook', labelKey: 'Facebook', icon: Facebook },
    { value: 'youtube', labelKey: 'Youtube', icon: Youtube },
    { value: 'twitter', labelKey: 'X - Twitter', icon: Twitter },
    { value: 'spotify', labelKey: 'Spotify', icon: Music2 },
    { value: 'tiktok', labelKey: 'Tiktok', icon: Music2 },
    { value: 'linkedin', labelKey: 'Linkedin', icon: Linkedin },
    { value: 'telegram', labelKey: 'Telegram', icon: Send },
    { value: 'thread', labelKey: 'Thread', icon: AtSign },
    { value: 'web_traffic', labelKey: 'Web Traffic', icon: Globe },
    { value: 'lainnya', labelKey: 'Lainnya', icon: Ellipsis },
    { value: 'instagram_followers', labelKey: 'Instagram Followers', icon: Instagram },
];

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

function resolveTopCategoryGroup(category: string): string {
    const normalized = category.trim().toLowerCase();

    if (normalized === '') {
        return 'lainnya';
    }

    const checks: Array<[string, string[]]> = [
        ['instagram_followers', ['instagram follower', 'instagram followers']],
        ['instagram', ['instagram']],
        ['facebook', ['facebook', 'fb ']],
        ['youtube', ['youtube', 'yt ']],
        ['twitter', ['twitter', 'x - twitter', 'x/twitter', 'x twitter']],
        ['spotify', ['spotify']],
        ['tiktok', ['tiktok', 'tik tok']],
        ['linkedin', ['linkedin']],
        ['telegram', ['telegram']],
        ['thread', ['thread', 'threads']],
        ['web_traffic', ['web traffic', 'traffic website', 'website traffic', 'web visitor']],
    ];

    for (const [group, keywords] of checks) {
        if (keywords.some((keyword) => normalized.includes(keyword))) {
            return group;
        }
    }

    return 'lainnya';
}

function getTopCategoryLabelKey(group: string): string {
    return topCategoryOptions.find((item) => item.value === group)?.labelKey ?? 'Lainnya';
}

type CategoryPickerContentProps = {
    categories: string[];
    categoryQuery: string;
    onCategoryQueryChange: (value: string) => void;
    selectedCategory: string;
    onSelect: (value: string) => void;
    t: (key: string) => string;
};

function CategoryPickerContent({
    categories,
    categoryQuery,
    onCategoryQueryChange,
    selectedCategory,
    onSelect,
    t,
}: CategoryPickerContentProps) {
    const filteredCategories = React.useMemo(() => {
        const keyword = categoryQuery.trim().toLowerCase();

        if (keyword === '') {
            return categories;
        }

        return categories.filter((item) => item.toLowerCase().includes(keyword));
    }, [categories, categoryQuery]);

    return (
        <div className="flex max-h-96 flex-col">
            <div className="border-b p-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={categoryQuery}
                        onChange={(event) => onCategoryQueryChange(event.target.value)}
                        placeholder={t('Cari kategori...')}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
                <button
                    type="button"
                    className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                        selectedCategory === ALL_CATEGORIES_VALUE
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                    )}
                    onClick={() => onSelect(ALL_CATEGORIES_VALUE)}
                >
                    <span>{t('Semua kategori')}</span>
                    {selectedCategory === ALL_CATEGORIES_VALUE && <Check className="size-4" />}
                </button>

                {filteredCategories.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className={cn(
                            'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                            selectedCategory === item ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        )}
                        onClick={() => onSelect(item)}
                    >
                        <span>{item}</span>
                        {selectedCategory === item && <Check className="size-4" />}
                    </button>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        {t('Tidak ada kategori yang cocok dengan pencarian.')}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Services() {
    const { t, locale } = useI18n();

    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [serviceQuery, setServiceQuery] = React.useState('');
    const [debouncedServiceQuery, setDebouncedServiceQuery] = React.useState('');
    const [activeTopCategory, setActiveTopCategory] = React.useState<string>(ALL_TOP_CATEGORIES_VALUE);
    const [isTopCategoryOpen, setIsTopCategoryOpen] = React.useState(false);
    const [category, setCategory] = React.useState<string>(ALL_CATEGORIES_VALUE);
    const [sort, setSort] = React.useState<SortValue>(DEFAULT_SORT_VALUE);
    const [perPage, setPerPage] = React.useState<PerPageValue>('25');
    const [page, setPage] = React.useState(1);
    const [categoryPickerQuery, setCategoryPickerQuery] = React.useState('');
    const [isCategorySelectOpen, setIsCategorySelectOpen] = React.useState(false);

    const [categories, setCategories] = React.useState<string[]>([]);
    const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([]);

    const [meta, setMeta] = React.useState({
        valid: 0,
        shown: 0,
        totalPages: 0,
    });

    const [detail, setDetail] = React.useState<Service | null>(null);

    const load = React.useCallback(
        async (opts: {
            q?: string;
            group?: string;
            category?: string;
            sort?: string;
            perPage?: string;
            page?: number;
        }) => {
            const startedAt = Date.now();
            setIsLoading(true);
            setError(null);

            try {
                const url = new URL('/api/services', window.location.origin);
                url.searchParams.set('obf', '1');
                url.searchParams.set('per_page', opts.perPage ?? '25');

                if (opts.q) {
                    url.searchParams.set('q', opts.q);
                }

                if (opts.group && opts.group !== ALL_TOP_CATEGORIES_VALUE) {
                    url.searchParams.set('group', opts.group);
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
                const elapsed = Date.now() - startedAt;
                const minMs = 250;
                if (elapsed < minMs) {
                    await new Promise((resolve) => window.setTimeout(resolve, minMs - elapsed));
                }
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
        load({ q: debouncedServiceQuery, group: activeTopCategory, category, sort, perPage, page });
    }, [load, debouncedServiceQuery, activeTopCategory, category, sort, perPage, page]);

    const selectedCategoryLabel = category === ALL_CATEGORIES_VALUE ? t('Pilih...') : category;

    const handleSelectExactCategory = React.useCallback(
        (value: string) => {
            if (value !== ALL_CATEGORIES_VALUE) {
                setActiveTopCategory(resolveTopCategoryGroup(value));
            }

            setCategory(value);
            setPage(1);
            setCategoryPickerQuery('');
            setIsCategorySelectOpen(false);

            toast.success(t('Kategori berhasil dipilih.'), {
                description: value === ALL_CATEGORIES_VALUE ? t('Semua kategori') : value,
            });
        },
        [t]
    );

    const handleSelectTopCategory = React.useCallback(
        (value: string) => {
            setActiveTopCategory(value);
            setCategory(ALL_CATEGORIES_VALUE);
            setPage(1);
            setCategoryPickerQuery('');

            const labelKey = getTopCategoryLabelKey(value);
            toast.success(t('Kategori berhasil dipilih.'), {
                description: t(labelKey),
            });
        },
        [t]
    );

    return (
        <>
            <Head title={t('Layanan')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        variant="small"
                        title={t('Layanan')}
                        description={t('Cari dan lihat daftar layanan.')}
                    />

                    <Button
                        type="button"
                        variant="default"
                        className="gap-2"
                        onClick={() => setIsTopCategoryOpen((open) => !open)}
                    >
                        <Tag className="size-4" />
                        {t('Kategori')}
                    </Button>
                </div>

                {isTopCategoryOpen && (
                    <div className="space-y-3 rounded-xl border bg-card p-4">
                        <div className="space-y-1">
                            <div className="text-sm font-semibold text-foreground">
                                {t('Kategori utama')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {t('Pilih kategori utama untuk memfilter layanan lebih cepat.')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
                            {topCategoryOptions.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTopCategory === item.value;

                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={cn(
                                            'flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors sm:min-h-11 sm:px-4 sm:py-3 sm:text-sm',
                                            isActive
                                                ? 'border-primary/40 bg-primary text-primary-foreground'
                                                : 'bg-muted/40 text-foreground hover:bg-muted'
                                        )}
                                        onClick={() => handleSelectTopCategory(item.value)}
                                    >
                                        <Icon className="size-4 sm:size-4" />
                                        <span>{t(item.labelKey)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

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
                                <Label htmlFor="category-select">{t('Kategori')}</Label>
                                <Popover open={isCategorySelectOpen} onOpenChange={setIsCategorySelectOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            id="category-select"
                                            type="button"
                                            className="mt-1 flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm"
                                        >
                                            <span className={cn(category === ALL_CATEGORIES_VALUE && 'text-muted-foreground')}>
                                                {selectedCategoryLabel}
                                            </span>
                                            <ChevronsUpDown className="size-4 text-muted-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        avoidCollisions={false}
                                        className="w-(--radix-popover-trigger-width) p-0"
                                    >
                                        <CategoryPickerContent
                                            categories={categories}
                                            categoryQuery={categoryPickerQuery}
                                            onCategoryQueryChange={setCategoryPickerQuery}
                                            selectedCategory={category}
                                            onSelect={handleSelectExactCategory}
                                            t={t}
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                        {t('Menampilkan')} {meta.shown} {t('dari')} {meta.valid}{' '}
                                        {t(meta.valid === 1 ? 'layanan' : 'layanan_plural')}
                                        {meta.totalPages > 0
                                            ? ` (${t('Halaman')} ${page} / ${meta.totalPages})`
                                            : ''}
                                    </span>
                                )}
                            </div>

                        </div>

                        <div className="overflow-hidden rounded-lg border">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/30">
                                        <tr className="text-left">
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('ID')}
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
                                                <tr className="border-t border-primary/20 bg-primary/10 text-primary">
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
                                    ? `${t('Halaman')} ${page} / ${meta.totalPages}`
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
