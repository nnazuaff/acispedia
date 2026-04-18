import { Head, router } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/i18n-provider';

type SuggestionRow = {
    id: number;
    user_id: number;
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
};

type PageProps = {
    suggestions: SuggestionsPaginator;
    filters: Filters;
};

export default function AdminKotakSaran({ suggestions, filters }: PageProps) {
    const { t } = useI18n();
    const rows = suggestions?.data ?? [];

    const go = (params: Record<string, any>) => {
        router.get('/kotak-saran', { ...filters, ...params }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Kotak Saran" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title={t('Kotak Saran')} description={t('Daftar saran dari pengguna.')} />

                <Card>
                    <CardContent className="pt-6">
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
                                            <tr key={row.id} className="border-t align-top">
                                                <td className="px-4 py-3 whitespace-nowrap">#{row.id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">#{row.user_id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.name}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.phone}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.category}</td>
                                                <td className="px-4 py-3 whitespace-pre-wrap wrap-break-word">{row.message}</td>
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
