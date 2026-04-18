import { Head, router } from '@inertiajs/react';
import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/utils';

type SuggestionRow = {
    id: number;
    user_id: number;
    user_name?: string;
    user_email?: string;
    name: string;
    phone: string;
    category: string;
    message: string;
    status: string;
    created_at_wib?: string | null;
};

type SuggestionsPaginator = {
    data: SuggestionRow[];
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
    per_page: number;
    date?: string | null;
    id?: number | null;
    user?: string | null;
    category?: string | null;
    status?: string | null;
};

type PageProps = {
    suggestions: SuggestionsPaginator;
    filters: Filters;
};

const CATEGORY_ALL = '__all__';
const STATUS_ALL = '__all__';

function parseYmdToLocalDate(value: string): Date | undefined {
    const raw = String(value ?? '').trim();
    if (raw === '') return undefined;

    const parts = raw.split('-');
    if (parts.length !== 3) return undefined;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return undefined;
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;

    return new Date(year, month - 1, day);
}

function formatLocalDateToYmd(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function AdminKotakSaran({ suggestions, filters }: PageProps) {
    const { t } = useI18n();
    const rows = suggestions?.data ?? [];

    const [perPage, setPerPage] = React.useState<number>(Number(filters?.per_page ?? 25));

    const [detail, setDetail] = React.useState<SuggestionRow | null>(null);

    const [draft, setDraft] = React.useState(() => ({
        date: filters?.date ?? '',
        id: filters?.id ? String(filters.id) : '',
        user: filters?.user ?? '',
        category: filters?.category ? filters.category : CATEGORY_ALL,
        status: filters?.status ? filters.status : STATUS_ALL,
    }));

    React.useEffect(() => {
        setDraft({
            date: filters?.date ?? '',
            id: filters?.id ? String(filters.id) : '',
            user: filters?.user ?? '',
            category: filters?.category ? filters.category : CATEGORY_ALL,
            status: filters?.status ? filters.status : STATUS_ALL,
        });
        setPerPage(Number(filters?.per_page ?? 25));
    }, [filters?.date, filters?.id, filters?.user, filters?.category, filters?.status, filters?.per_page]);

    const go = (params: Record<string, any>) => {
        router.get('/kotak-saran', { ...filters, per_page: perPage, ...params }, { preserveState: true, replace: true });
    };

    const truncate = (text: string, max = 15) => {
        const clean = text ?? '';
        if (clean.length <= max) return clean;
        return clean.slice(0, max) + '…';
    };

    const applyFilters = () => {
        const idNum = Number.parseInt(draft.id || '0', 10);

        go({
            page: 1,
            date: draft.date || undefined,
            id: Number.isFinite(idNum) && idNum > 0 ? idNum : undefined,
            user: draft.user.trim() || undefined,
            category: draft.category === CATEGORY_ALL ? undefined : draft.category,
            status: draft.status === STATUS_ALL ? undefined : draft.status,
            per_page: perPage,
        });
    };

    const resetFilters = () => {
        setDraft({ date: '', id: '', user: '', category: CATEGORY_ALL, status: STATUS_ALL });
        setPerPage(25);
        go({ page: 1, date: undefined, id: undefined, user: undefined, category: undefined, status: undefined, per_page: 25 });
    };

    return (
        <>
            <Head title="Kotak Saran" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title={t('Kotak Saran')} description={t('Daftar saran dari pengguna.')} />

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-3 pb-4 md:grid-cols-6">
                            <div className="space-y-1">
                                <Label htmlFor="date">{t('Tanggal')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            id="date"
                                            type="button"
                                            className={cn(
                                                'border-input placeholder:text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
                                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                                !draft.date ? 'text-muted-foreground' : ''
                                            )}
                                        >
                                            <span className="truncate">{draft.date || t('Pilih tanggal')}</span>
                                            <CalendarIcon className="ml-2 size-4 shrink-0 text-muted-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={parseYmdToLocalDate(draft.date)}
                                            onSelect={(day) => {
                                                if (!day) return;
                                                const clicked = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                                                setDraft((s) => ({ ...s, date: formatLocalDateToYmd(clicked) }));
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="id">{t('ID')}</Label>
                                <Input
                                    id="id"
                                    inputMode="numeric"
                                    placeholder="123"
                                    value={draft.id}
                                    onChange={(e) => setDraft((s) => ({ ...s, id: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="user">{t('Nama User')}</Label>
                                <Input
                                    id="user"
                                    placeholder={t('Cari nama / email...')}
                                    value={draft.user}
                                    onChange={(e) => setDraft((s) => ({ ...s, user: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>{t('Kategori')}</Label>
                                <Select
                                    value={draft.category}
                                    onValueChange={(v) => setDraft((s) => ({ ...s, category: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Semua')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={CATEGORY_ALL}>{t('Semua')}</SelectItem>
                                        <SelectItem value="saran">{t('Saran')}</SelectItem>
                                        <SelectItem value="keluhan">{t('Keluhan')}</SelectItem>
                                        <SelectItem value="lainnya">{t('Lainnya')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>{t('Status')}</Label>
                                <Select value={draft.status} onValueChange={(v) => setDraft((s) => ({ ...s, status: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Semua')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={STATUS_ALL}>{t('Semua')}</SelectItem>
                                        <SelectItem value="belum_selesai">{t('Belum Selesai')}</SelectItem>
                                        <SelectItem value="selesai">{t('Selesai')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pb-4">
                            <Button onClick={applyFilters}>
                                {t('Filter')}
                            </Button>
                            <Button variant="outline" onClick={resetFilters}>
                                {t('Atur Ulang')}
                            </Button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('ID')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Dibuat')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('User')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Nama')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('HP')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Kategori')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Status')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Saran')}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Aksi')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={9}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id} className="border-t align-top">
                                                <td className="px-4 py-3 whitespace-nowrap">#{row.id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">#{row.user_id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.name}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.phone}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.category}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.status === 'selesai' ? t('Selesai') : t('Belum Selesai')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">{truncate(row.message)}</td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <Button variant="outline" size="sm" onClick={() => setDetail(row)}>
                                                        {t('Detail')}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                {t('Menampilkan')}{' '}
                                {suggestions?.from ?? 0}–{suggestions?.to ?? rows.length} {t('dari')}{' '}
                                {suggestions?.total ?? rows.length}
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!suggestions?.prev_page_url}
                                    onClick={() => go({ page: Math.max(1, (suggestions?.current_page ?? 1) - 1) })}
                                >
                                    {t('Sebelumnya')}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!suggestions?.next_page_url}
                                    onClick={() => go({ page: (suggestions?.current_page ?? 1) + 1 })}
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
                                            go({ per_page: next, page: 1 });
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

                <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
                    <DialogContent className="max-h-[calc(100vh-2rem)] overflow-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t('Detail Saran')}</DialogTitle>
                        </DialogHeader>

                        {detail ? (
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('ID')}
                                        </div>
                                        <div className="text-sm font-semibold">#{detail.id}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Dibuat')}
                                        </div>
                                        <div className="text-sm font-medium">{detail.created_at_wib ?? '-'}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('User ID')}
                                        </div>
                                        <div className="text-sm font-medium">#{detail.user_id}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Nama User')}
                                        </div>
                                        <div className="text-sm font-medium">{detail.user_name || '-'}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Email')}
                                        </div>
                                        <div className="text-sm font-medium">{detail.user_email || '-'}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Nama')}
                                        </div>
                                        <div className="text-sm font-medium">{detail.name || '-'}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('HP')}
                                        </div>
                                        <div className="text-sm font-medium">{detail.phone || '-'}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Kategori')}
                                        </div>
                                        <div className="text-sm font-medium">{detail.category || '-'}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Status')}
                                        </div>
                                        <div className="text-sm font-medium">
                                            {detail.status === 'selesai' ? t('Selesai') : t('Belum Selesai')}
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Saran')}
                                        </div>
                                        <div className="text-sm font-medium whitespace-pre-wrap break-words break-all">{detail.message}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">{t('Data tidak ditemukan.')}</div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
