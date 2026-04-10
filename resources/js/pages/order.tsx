import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useI18n } from '@/i18n/i18n-provider';

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

    const pinnedServiceRef = React.useRef<Service | null>(null);

    const [serviceQuery, setServiceQuery] = React.useState('');
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

    const loadCategories = React.useCallback(async () => {
        setError(null);
        setIsBootLoading(true);

        try {
            const url = new URL('/api/services', window.location.origin);
            url.searchParams.set('obf', '1');
            url.searchParams.set('per_page', '1');

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
            setIsBootLoading(false);
        }
    }, [t]);

    const loadServices = React.useCallback(
        async (opts: { category: string; q: string; preselectId?: string | null }) => {
            setError(null);
            setIsServiceLoading(true);

            try {
                const url = new URL('/api/services', window.location.origin);
                url.searchParams.set('obf', '1');
                url.searchParams.set('per_page', '200');
                url.searchParams.set('page', '1');

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
                setIsServiceLoading(false);
            }
        },
        [t]
    );

    React.useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    React.useEffect(() => {
        loadServices({ category, q: serviceQuery, preselectId: null });
    }, [category]);

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

                <div className="grid gap-4 lg:grid-cols-12">
                    <Card className="lg:col-span-8">
                        <CardHeader>
                            <CardTitle>{t('Form Order')}</CardTitle>
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
                                    <Select
                                        value={category}
                                        onValueChange={(v) => {
                                            setCategory(v);
                                            setServiceId(NO_SERVICE_VALUE);
                                            setServices([]);
                                        }}
                                    >
                                        <SelectTrigger id="category" className="w-full min-w-0">
                                            <div className="min-w-0 flex-1 overflow-hidden">
                                                <SelectValue
                                                    className="block truncate"
                                                    placeholder={t('Pilih kategori')}
                                                />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent align="start">
                                            <SelectItem value={ALL_CATEGORIES_VALUE}>
                                                {t('Semua kategori')}
                                            </SelectItem>
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_search">{t('Cari layanan')}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="service_search"
                                            value={serviceQuery}
                                            onChange={(e) => setServiceQuery(e.target.value)}
                                            placeholder={t('Ketik nama layanan...')}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isServiceLoading}
                                            onClick={() =>
                                                loadServices({
                                                    category,
                                                    q: serviceQuery,
                                                    preselectId: null,
                                                })
                                            }
                                        >
                                            {isServiceLoading ? (
                                                <Spinner className="size-4" />
                                            ) : (
                                                t('Cari')
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="service">{t('Layanan')}</Label>
                                <Select
                                    value={serviceId}
                                    onValueChange={(v) => {
                                        setServiceId(v);
                                        const sid = Number(v);
                                        const svc = services.find((s) => s.id === sid) ?? null;
                                        if (svc) {
                                            setQuantity(String(svc.min ?? 1));
                                            setComments('');
                                        }
                                    }}
                                >
                                    <SelectTrigger id="service" className="w-full min-w-0">
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <SelectValue
                                                className="block truncate"
                                                placeholder={
                                                    isBootLoading ? t('Memuat...') : t('Pilih layanan')
                                                }
                                            />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        <SelectItem value={NO_SERVICE_VALUE}>
                                            {t('Pilih layanan')}
                                        </SelectItem>
                                        {services.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-muted-foreground">
                                    {t('Jika layanan tidak muncul, gunakan kolom pencarian.')}
                                </div>
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
