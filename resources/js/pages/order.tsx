import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
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
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    price_with_markup?: number;
    min: number;
    max: number;
    average_time: string | null;
};

type ServicesPayload = {
    success: boolean;
    message?: string;
    services?: Record<string, Service[]> | Service[];
    categories?: Record<string, string> | string[];
    markup_amount?: number;
};

const ALL_CATEGORIES_VALUE = '__all__';
const NO_SERVICE_VALUE = '__none__';
const ALL_TOP_CATEGORIES_VALUE = '__all_groups__';

type TopCategoryOption = {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

const topCategoryOptions: TopCategoryOption[] = [
    { value: ALL_TOP_CATEGORIES_VALUE, label: 'Semua Kategori', icon: LayoutGrid },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'youtube', label: 'Youtube', icon: Youtube },
    { value: 'twitter', label: 'X - Twitter', icon: Twitter },
    { value: 'spotify', label: 'Spotify', icon: Music2 },
    { value: 'tiktok', label: 'Tiktok', icon: Music2 },
    { value: 'linkedin', label: 'Linkedin', icon: Linkedin },
    { value: 'telegram', label: 'Telegram', icon: Send },
    { value: 'thread', label: 'Thread', icon: AtSign },
    { value: 'web_traffic', label: 'Web Traffic', icon: Globe },
    { value: 'lainnya', label: 'Lainnya', icon: Ellipsis },
    { value: 'instagram_followers', label: 'Instagram Followers', icon: Instagram },
];

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
                            selectedCategory === item
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted'
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

type ServicePickerContentProps = {
    services: Service[];
    query: string;
    onQueryChange: (value: string) => void;
    selectedServiceId: string;
    onSelect: (value: string) => void;
    isLoading: boolean;
    t: (key: string) => string;
};

function ServicePickerContent({
    services,
    query,
    onQueryChange,
    selectedServiceId,
    onSelect,
    isLoading,
    t,
}: ServicePickerContentProps) {
    const filteredServices = React.useMemo(() => {
        const keyword = query.trim().toLowerCase();

        if (keyword === '') {
            return services;
        }

        return services.filter((item) => item.name.toLowerCase().includes(keyword));
    }, [query, services]);

    return (
        <div className="flex max-h-112 flex-col">
            <div className="border-b p-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder={t('Cari layanan...')}
                        className="pl-9"
                    />
                </div>
                {isLoading && (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Spinner className="size-3.5" />
                        <span>{t('Memuat layanan...')}</span>
                    </div>
                )}
            </div>

            <div className="max-h-88 overflow-y-auto p-2">
                <button
                    type="button"
                    className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                        selectedServiceId === NO_SERVICE_VALUE
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                    )}
                    onClick={() => onSelect(NO_SERVICE_VALUE)}
                >
                    <span>{t('Pilih layanan')}</span>
                    {selectedServiceId === NO_SERVICE_VALUE && <Check className="size-4" />}
                </button>

                {filteredServices.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={cn(
                            'w-full rounded-md px-3 py-2 text-left transition-colors',
                            selectedServiceId === String(item.id)
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted'
                        )}
                        onClick={() => onSelect(String(item.id))}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="whitespace-normal wrap-break-word text-sm font-medium text-foreground">
                                    {item.name}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {(item.price_formatted ?? '—') + ' • ' + t('Min') + ' ' + item.min + ' • ' + t('Maks') + ' ' + item.max}
                                </div>
                            </div>
                            {selectedServiceId === String(item.id) && <Check className="mt-0.5 size-4 shrink-0" />}
                        </div>
                    </button>
                ))}

                {!isLoading && filteredServices.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        {t('Tidak ada layanan yang cocok dengan pencarian.')}
                    </div>
                )}
            </div>
        </div>
    );
}

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

function flattenServices(services: ServicesPayload['services']): Service[] {
    if (!services) return [];
    if (Array.isArray(services)) return services;

    const flattened: Service[] = [];
    Object.values(services).forEach((list) => {
        if (Array.isArray(list)) list.forEach((s) => flattened.push(s));
    });
    return flattened;
}

function normalizeCategories(categories: ServicesPayload['categories']): string[] {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
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

function getCookie(name: string): string | null {
    const parts = document.cookie.split(';');
    for (const part of parts) {
        const [rawKey, ...rest] = part.trim().split('=');
        if (rawKey === name) {
            return rest.join('=') || '';
        }
    }
    return null;
}

function getXsrfToken(): string | null {
    const token = getCookie('XSRF-TOKEN');
    return token ? decodeURIComponent(token) : null;
}

function serviceRequiresCustomComments(service: Pick<Service, 'name' | 'category' | 'description'>): boolean {
    const text = `${service.name} ${service.category} ${service.description}`.trim();
    if (!text) return false;
    return /((?:custom|costum|kustom)\s*comments?|(?:custom|costum|kustom)\s*comment)/i.test(text);
}

function countNonEmptyLines(raw: string): number {
    return raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean).length;
}

function formatRupiah(value: number): string {
    const safe = Number.isFinite(value) ? value : 0;
    return `Rp ${Math.round(safe).toLocaleString('id-ID')}`;
}

export default function OrderPage() {
    const { t, locale } = useI18n();
    const page = usePage();
    const user = (page.props as any).auth?.user as any;
    const balance = typeof user?.balance === 'number' ? user.balance : 0;

    const [isBootLoading, setIsBootLoading] = React.useState(true);
    const [isServiceLoading, setIsServiceLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [categories, setCategories] = React.useState<string[]>([]);
    const [category, setCategory] = React.useState<string>(ALL_CATEGORIES_VALUE);
    const [activeTopCategory, setActiveTopCategory] = React.useState<string>(ALL_TOP_CATEGORIES_VALUE);
    const [isTopCategoryOpen, setIsTopCategoryOpen] = React.useState(false);
    const [isCategorySelectOpen, setIsCategorySelectOpen] = React.useState(false);
    const [isServiceSelectOpen, setIsServiceSelectOpen] = React.useState(false);
    const [categoryPickerQuery, setCategoryPickerQuery] = React.useState('');
    const [servicePickerQuery, setServicePickerQuery] = React.useState('');
    const [debouncedServicePickerQuery, setDebouncedServicePickerQuery] = React.useState('');

    const pinnedServiceRef = React.useRef<Service | null>(null);

    const [services, setServices] = React.useState<Service[]>([]);
    const [serviceId, setServiceId] = React.useState<string>(NO_SERVICE_VALUE);
    const selectedService = React.useMemo(() => {
        const sid = Number(serviceId);
        if (!Number.isFinite(sid)) return null;
        return services.find((s) => s.id === sid) ?? null;
    }, [serviceId, services]);

    const [target, setTarget] = React.useState('');
    const [quantity, setQuantity] = React.useState('');
    const [comments, setComments] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const preselectMeta = React.useMemo(() => {
        let sid: string | null = null;
        let source: 'session' | 'query' | null = null;
        let shouldToast = false;

        try {
            const fromSession = window.sessionStorage.getItem('order_preselect_service_id');
            if (fromSession) {
                sid = String(Number(fromSession));
                source = 'session';
                shouldToast = window.sessionStorage.getItem('order_preselect_service_flash') === '1';

                window.sessionStorage.removeItem('order_preselect_service_id');
                window.sessionStorage.removeItem('order_preselect_service_flash');
            }
        } catch {
            // ignore
        }

        if (!sid) {
            const params = new URLSearchParams(window.location.search);
            const raw = params.get('service_id');
            if (raw) {
                sid = String(Number(raw));
                source = 'query';
                shouldToast = true;
            }
        }

        return { serviceId: sid, source, shouldToast } as const;
    }, []);

    const didShowPreselectToast = React.useRef(false);

    React.useEffect(() => {
        const uid = Number(user?.id);
        if (!Number.isFinite(uid) || uid <= 0) return;

        const echo = (window as any)?.Echo;
        if (!echo) return;

        const channelName = `orders.${uid}`;
        const channel = echo.private(channelName);

        channel.listen('.order.status.updated', (payload: any) => {
            const next = payload?.order?.status;
            const name = payload?.order?.service_name;
            if (typeof next === 'string' && next.trim()) {
                toast.message(t('Status pesanan diperbarui'), {
                    description: name ? `${name} • ${next}` : next,
                });
            }
        });

        return () => {
            try {
                echo.leave(channelName);
            } catch {
                // ignore
            }
        };
    }, [t, user?.id]);

    const loadCategories = React.useCallback(async (opts?: { group?: string }) => {
        const startedAt = Date.now();
        setError(null);
        setIsBootLoading(true);

        try {
            const url = new URL('/api/services', window.location.origin);
            url.searchParams.set('obf', '1');
            url.searchParams.set('per_page', '1');

            const group = opts?.group ?? '';
            if (group && group !== ALL_TOP_CATEGORIES_VALUE) {
                url.searchParams.set('group', group);
            }

            const res = await fetch(url.toString(), {
                method: 'GET',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const raw = (await res.json()) as unknown;
            const json = unpackApiPayload(raw);

            if (!json.success) {
                setError(t(json.message ?? 'Gagal memuat kategori.'));
                setCategories([]);
                return;
            }

            setCategories(normalizeCategories(json.categories));
        } catch (e) {
            setError(e instanceof Error ? e.message : t('Kesalahan tidak diketahui.'));
        } finally {
            const elapsed = Date.now() - startedAt;
            const minMs = 250;
            if (elapsed < minMs) {
                await new Promise((resolve) => window.setTimeout(resolve, minMs - elapsed));
            }
            setIsBootLoading(false);
        }
    }, [t]);

    const loadServices = React.useCallback(
        async (opts: { group: string; category: string; q: string; preselectId?: string | null }) => {
            const startedAt = Date.now();
            setError(null);
            setIsServiceLoading(true);

            try {
                const url = new URL('/api/services', window.location.origin);
                url.searchParams.set('obf', '1');
                url.searchParams.set('per_page', '200');
                url.searchParams.set('page', '1');

                if (opts.group && opts.group !== ALL_TOP_CATEGORIES_VALUE) {
                    url.searchParams.set('group', opts.group);
                }

                if (opts.category && opts.category !== ALL_CATEGORIES_VALUE) {
                    url.searchParams.set('category', opts.category);
                }
                if (opts.q.trim()) {
                    url.searchParams.set('q', opts.q.trim());
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
                    setServices([]);
                    setServiceId(NO_SERVICE_VALUE);
                    return;
                }

                const pinned = pinnedServiceRef.current;
                let list = flattenServices(json.services);

                if (
                    pinned &&
                    !opts.q.trim() &&
                    (opts.category === ALL_CATEGORIES_VALUE || opts.category === pinned.category) &&
                    (opts.group === ALL_TOP_CATEGORIES_VALUE || resolveTopCategoryGroup(pinned.category) === opts.group) &&
                    !list.some((s) => s.id === pinned.id)
                ) {
                    list = [pinned, ...list];
                }

                setServices(list);

                if (opts.preselectId) {
                    const sid = Number(opts.preselectId);
                    const found = list.some((s) => s.id === sid);
                    if (found) {
                        setServiceId(String(sid));
                        const svc = list.find((s) => s.id === sid) ?? null;
                        if (svc) {
                            setQuantity(String(svc.min ?? 1));
                        }
                    }
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : t('Kesalahan tidak diketahui.'));
            } finally {
                const elapsed = Date.now() - startedAt;
                const minMs = 250;
                if (elapsed < minMs) {
                    await new Promise((resolve) => window.setTimeout(resolve, minMs - elapsed));
                }
                setIsServiceLoading(false);
            }
        },
        [t]
    );

    React.useEffect(() => {
        loadCategories({ group: activeTopCategory });
    }, [loadCategories, activeTopCategory]);

    React.useEffect(() => {
        loadServices({ group: activeTopCategory, category, q: debouncedServicePickerQuery, preselectId: null });
    }, [category, activeTopCategory, debouncedServicePickerQuery, loadServices]);

    React.useEffect(() => {
        const id = window.setTimeout(() => {
            setDebouncedServicePickerQuery(servicePickerQuery);
        }, 350);

        return () => window.clearTimeout(id);
    }, [servicePickerQuery]);

    React.useEffect(() => {
        const sid = preselectMeta.serviceId;

        if (!sid) {
            return;
        }

        (async () => {
            try {
                const res = await fetch(`/api/service/${encodeURIComponent(sid)}`, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                const json = (await res.json()) as any;
                if (!res.ok || !json?.success || !json?.service) {
                    return;
                }

                const svc = json.service as Service;
                pinnedServiceRef.current = svc;
                setActiveTopCategory(resolveTopCategoryGroup(svc.category || ''));
                setCategory(svc.category || ALL_CATEGORIES_VALUE);
                setServices([svc]);
                setServiceId(String(svc.id));
                setQuantity(String(svc.min ?? 1));

                if (!didShowPreselectToast.current && preselectMeta.shouldToast) {
                    didShowPreselectToast.current = true;
                    toast.success(t('Layanan berhasil dipilih.'), {
                        description: svc.name,
                    });
                }

                if (preselectMeta.source === 'query') {
                    try {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('service_id');
                        const next = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}${url.hash}`;
                        window.history.replaceState({}, '', next);
                    } catch {
                        // ignore
                    }
                }
            } catch {
                // ignore best-effort preselect
            }
        })();
    }, [preselectMeta.serviceId, preselectMeta.shouldToast, preselectMeta.source]);

    const needsComments = selectedService ? serviceRequiresCustomComments(selectedService) : false;
    const qtyNum = Number(quantity);

    const pricePer1000 = selectedService?.price_with_markup ?? null;
    const totalPrice =
        pricePer1000 !== null && Number.isFinite(qtyNum)
            ? Math.round((pricePer1000 / 1000) * qtyNum)
            : 0;

    return (
        <>
            <Head title={t('Order')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-4">
                <div className="space-y-1">
                    <Heading
                        variant="small"
                        title={t('Buat Pesanan')}
                        description={t('Pilih layanan, masukkan target, lalu buat pesanan.')}
                    />
                </div>

                {isTopCategoryOpen && (
                    <div className="space-y-3 rounded-xl border bg-card p-4">
                        <div className="text-sm font-semibold text-foreground">{t('Kategori utama')}</div>

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
                                        onClick={() => {
                                            setActiveTopCategory(item.value);
                                            setCategory(ALL_CATEGORIES_VALUE);
                                            setServiceId(NO_SERVICE_VALUE);
                                            setServices([]);
                                            setServicePickerQuery('');
                                            setDebouncedServicePickerQuery('');
                                            setCategoryPickerQuery('');

                                            toast.success(
                                                locale === 'en'
                                                    ? `${item.label} selected.`
                                                    : `${item.label} berhasil dipilih.`
                                            );
                                        }}
                                    >
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-12">
                    <Card className="lg:col-span-8">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle>{t('Buat Pesanan')}</CardTitle>
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
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category">{t('Kategori')}</Label>
                                    <Popover open={isCategorySelectOpen} onOpenChange={setIsCategorySelectOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                id="category"
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm"
                                            >
                                                <span
                                                    className={cn(
                                                        'min-w-0 flex-1 truncate text-left',
                                                        category === ALL_CATEGORIES_VALUE && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {category === ALL_CATEGORIES_VALUE ? t('Semua kategori') : category}
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
                                                onSelect={(value) => {
                                                    if (value !== ALL_CATEGORIES_VALUE) {
                                                        setActiveTopCategory(resolveTopCategoryGroup(value));
                                                    }

                                                    setCategory(value);
                                                    setServiceId(NO_SERVICE_VALUE);
                                                    setServices([]);
                                                    setCategoryPickerQuery('');
                                                    setServicePickerQuery('');
                                                    setDebouncedServicePickerQuery('');
                                                    setIsCategorySelectOpen(false);

                                                    toast.success(t('Kategori berhasil dipilih.'), {
                                                        description:
                                                            value === ALL_CATEGORIES_VALUE
                                                                ? t('Semua kategori')
                                                                : value,
                                                    });
                                                }}
                                                t={t}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="service">{t('Layanan')}</Label>
                                <Popover open={isServiceSelectOpen} onOpenChange={setIsServiceSelectOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            id="service"
                                            type="button"
                                            className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-left text-sm"
                                        >
                                            <div className="min-w-0 flex-1">
                                                {selectedService ? (
                                                    <div className="whitespace-normal wrap-break-word font-medium text-foreground">
                                                        {selectedService.name}
                                                    </div>
                                                ) : (
                                                    <div className="text-muted-foreground">
                                                        {isBootLoading ? t('Memuat...') : t('Pilih layanan')}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        avoidCollisions={false}
                                        className="w-(--radix-popover-trigger-width) p-0"
                                    >
                                        <ServicePickerContent
                                            services={services}
                                            query={servicePickerQuery}
                                            onQueryChange={setServicePickerQuery}
                                            selectedServiceId={serviceId}
                                            onSelect={(value) => {
                                                setServiceId(value);
                                                const sid = Number(value);
                                                const svc = services.find((s) => s.id === sid) ?? null;
                                                if (svc) {
                                                    setQuantity(String(svc.min ?? 1));
                                                    setComments('');
                                                }

                                                if (value !== NO_SERVICE_VALUE) {
                                                    setIsServiceSelectOpen(false);
                                                }
                                            }}
                                            isLoading={isServiceLoading}
                                            t={t}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="target">{t('Target')}</Label>
                                    <Input
                                        id="target"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        placeholder={t('Link / Username')}
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        {t('Bingung pengisian target?')}{' '}
                                        <Link
                                            href="/panduan-target"
                                            className="underline underline-offset-4 hover:decoration-current"
                                        >
                                            {t('klik disini')}
                                        </Link>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">{t('Quantity')}</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        inputMode="numeric"
                                        min={selectedService?.min}
                                        max={selectedService?.max}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder={selectedService ? String(selectedService.min) : '0'}
                                    />
                                    {selectedService && (
                                        <div className="text-xs text-muted-foreground">
                                            {t('Min')} {selectedService.min} • {t('Maks')} {selectedService.max}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {needsComments && (
                                <div className="space-y-2">
                                    <Label htmlFor="comments">{t('Comments (1 baris = 1 quantity)')}</Label>
                                    <textarea
                                        id="comments"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={7}
                                        className="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive md:text-sm"
                                        placeholder={t('Tulis 1 komentar per baris')}
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        {t('Baris terisi')}: {countNonEmptyLines(comments)}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg border bg-muted/20 p-3">
                                    <div className="text-xs font-semibold text-muted-foreground">{t('Harga / 1000')}</div>
                                    <div className="mt-1 font-semibold text-emerald-600 dark:text-emerald-500">
                                        {selectedService?.price_formatted ?? '—'}
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-muted/20 p-3">
                                    <div className="text-xs font-semibold text-muted-foreground">{t('Total')}</div>
                                    <div className="mt-1 font-semibold text-foreground">
                                        {selectedService && Number.isFinite(qtyNum)
                                            ? formatRupiah(totalPrice)
                                            : '—'}
                                    </div>
                                </div>
                            </div>

                            {selectedService && (
                                <div className="rounded-lg border p-3">
                                    <div className="text-xs font-semibold text-muted-foreground">{t('Deskripsi')}</div>
                                    <div className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
                                        {normalizeDescription(selectedService.description)}
                                    </div>
                                    {selectedService.average_time && (
                                        <div className="mt-2 text-xs font-medium text-muted-foreground">
                                            {t('Estimasi')}: {selectedService.average_time}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={async () => {
                                        if (!selectedService) {
                                            toast.error(t('Pilih layanan terlebih dahulu.'));
                                            return;
                                        }

                                        const qty = Number(quantity);
                                        if (!target.trim()) {
                                            toast.error(t('Target wajib diisi.'));
                                            return;
                                        }
                                        if (!Number.isFinite(qty) || qty <= 0) {
                                            toast.error(t('Quantity tidak valid.'));
                                            return;
                                        }

                                        if (needsComments) {
                                            const lineCount = countNonEmptyLines(comments);
                                            if (lineCount !== qty) {
                                                toast.error(t('Jumlah baris komentar harus sama dengan quantity.'));
                                                return;
                                            }
                                        }

                                        setIsSubmitting(true);

                                        try {
                                            const xsrf = getXsrfToken();
                                            const res = await fetch('/api/orders', {
                                                method: 'POST',
                                                credentials: 'same-origin',
                                                headers: {
                                                    Accept: 'application/json',
                                                    'Content-Type': 'application/json',
                                                    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
                                                },
                                                body: JSON.stringify({
                                                    service_id: selectedService.id,
                                                    target,
                                                    quantity: qty,
                                                    comments: comments || undefined,
                                                }),
                                            });

                                            if (res.status === 419) {
                                                toast.error(t('Sesi habis. Silakan refresh dan login lagi.'));
                                                return;
                                            }

                                            const json = (await res.json()) as any;

                                            if (!res.ok || !json?.success) {
                                                const rawMsg =
                                                    json?.message ||
                                                    (json?.code === 'INSUFFICIENT_BALANCE'
                                                        ? 'Saldo tidak cukup.'
                                                        : 'Gagal membuat order.');
                                                const msg = t(rawMsg);

                                                if (json?.code === 'INSUFFICIENT_BALANCE' && json?.formatted) {
                                                    toast.error(
                                                        locale === 'en'
                                                            ? `${msg} Short by ${json.formatted.shortfall}.`
                                                            : `${msg} Kurang ${json.formatted.shortfall}.`
                                                    );
                                                } else {
                                                    toast.error(msg);
                                                }

                                                return;
                                            }

                                            toast.success(t('Order berhasil dibuat.'));
                                            router.get(
                                                '/history/transaction',
                                                {
                                                    page: 1,
                                                    per_page: 25,
                                                },
                                                {
                                                    preserveState: false,
                                                    preserveScroll: false,
                                                    replace: true,
                                                }
                                            );
                                            return;
                                        } catch (e) {
                                            toast.error(
                                                e instanceof Error ? e.message : t('Kesalahan tidak diketahui.')
                                            );
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }}
                                >
                                    {isSubmitting ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Spinner className="size-4" />
                                            {t('Memproses...')}
                                        </span>
                                    ) : (
                                        t('Buat Pesanan')
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-4 lg:sticky lg:top-20">
                        <CardHeader>
                            <CardTitle>{t('Informasi')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="rounded-lg border bg-muted/20 p-3">
                                <div className="text-xs font-semibold text-muted-foreground">{t('Saldo')}</div>
                                <div className="mt-1 font-semibold text-foreground">{formatRupiah(balance)}</div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-muted-foreground">Instagram</div>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                    <li>{t('Pastikan akun tidak private saat order diproses.')}</li>
                                    <li>{t('Jangan ubah username/tautan selama pesanan berjalan.')}</li>
                                    <li>{t('Jika order untuk postingan, pastikan post tidak dihapus.')}</li>
                                </ul>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-muted-foreground">{t('Langkah Order')}</div>
                                <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                                    <li>{t('Pilih kategori dan layanan.')}</li>
                                    <li>{t('Masukkan target (link/username).')}</li>
                                    <li>{t('Isi quantity sesuai batas min/maks.')}</li>
                                    <li>{t('Jika layanan butuh comments, isi 1 baris per quantity.')}</li>
                                    <li>{t('Klik “Buat Pesanan”. Status akan update otomatis.')}</li>
                                </ol>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-muted-foreground">{t('Aturan')}</div>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                    <li>{t('Pastikan target benar, pesanan tidak bisa dibatalkan setelah diproses.')}</li>
                                    <li>{t('Jangan buat pesanan ganda untuk target yang sama secara bersamaan.')}</li>
                                    <li>{t('Jika ada kendala, cek status beberapa menit kemudian.')}</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                                {t('Gunakan layanan dengan bijak. Kesalahan input target/quantity bisa menyebabkan hasil tidak sesuai.')}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

OrderPage.layout = {
    breadcrumbs: [
        {
            title: 'Order',
            href: '/order',
        },
    ],
};
