import { Head, router } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

type SuggestionRow = {
    id: number;
    user_id: number;
    user_name?: string;
    user_email?: string;
    name: string;
    phone: string;
    category: string;
    message: string;
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
};

type PageProps = {
    suggestions: SuggestionsPaginator;
    filters: Filters;
};

const CATEGORY_ALL = '__all__';

export default function AdminKotakSaran({ suggestions, filters }: PageProps) {
    const { t } = useI18n();
    const rows = suggestions?.data ?? [];

    const [expandedId, setExpandedId] = React.useState<number | null>(null);

    const [draft, setDraft] = React.useState(() => ({
        date: filters?.date ?? '',
        id: filters?.id ? String(filters.id) : '',
        user: filters?.user ?? '',
        category: filters?.category ? filters.category : CATEGORY_ALL,
    }));

    const go = (params: Record<string, any>) => {
        router.get('/kotak-saran', { ...filters, ...params }, { preserveState: true, replace: true });
    };

    const truncate = (text: string, max = 120) => {
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
        });
    };

    return (
        <>
            <Head title="Kotak Saran" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title={t('Kotak Saran')} description={t('Daftar saran dari pengguna.')} />

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-3 pb-4 md:grid-cols-5">
                            <div className="space-y-1">
                                <Label htmlFor="date">{t('Tanggal')}</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={draft.date}
                                    onChange={(e) => setDraft((s) => ({ ...s, date: e.target.value }))}
                                />
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
                        </div>

                        <div className="flex items-center justify-end gap-2 pb-4">
                            <Button variant="outline" onClick={applyFilters}>
                                {t('Filter')}
                            </Button>
                        </div>

                        <div className="flex items-center justify-end gap-2 pb-4">
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
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={8}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <React.Fragment key={row.id}>
                                                <tr className="border-t align-top">
                                                    <td className="px-4 py-3 whitespace-nowrap">#{row.id}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{row.created_at_wib ?? '-'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">#{row.user_id}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{row.name}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{row.phone}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{row.category}</td>
                                                    <td className="px-4 py-3 whitespace-pre-wrap wrap-break-word">
                                                        {expandedId === row.id ? row.message : truncate(row.message)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setExpandedId((cur) => (cur === row.id ? null : row.id))
                                                            }
                                                        >
                                                            {expandedId === row.id ? t('Tutup') : t('Detail')}
                                                        </Button>
                                                    </td>
                                                </tr>

                                                {expandedId === row.id && (
                                                    <tr className="border-t bg-muted/10">
                                                        <td className="px-4 py-3 text-xs text-muted-foreground" colSpan={8}>
                                                            <div className="grid gap-1 md:grid-cols-2">
                                                                <div>
                                                                    {t('User')}: {row.user_name || '-'}
                                                                </div>
                                                                <div>
                                                                    {t('Email')}: {row.user_email || '-'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
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
