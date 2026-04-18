import { Head, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/i18n-provider';

type ConnectionsPayload = {
    connections: {
        medanpedia: {
            configured: boolean;
            profile: unknown;
        };
        midtrans: {
            enabled: boolean;
            configured: boolean;
            environment: string;
        };
        tripay: {
            enabled: boolean;
            configured: boolean;
            channels: unknown;
        };
    };
    markup_amount: number;
};

export default function AdminConnections() {
    const { t } = useI18n();
    const { connections, markup_amount } = usePage().props as any as ConnectionsPayload;

    const [markupAmount, setMarkupAmount] = React.useState<string>(String(markup_amount ?? 0));

    React.useEffect(() => {
        setMarkupAmount(String(markup_amount ?? 0));
    }, [markup_amount]);

    function saveMarkup() {
        const n = Math.max(0, Math.round(Number(markupAmount || 0)));
        router.post(
            '/connections/markup',
            { markup_amount: n } as any,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMarkupAmount(String(n));
                },
            },
        );
    }

    return (
        <>
            <Head title={t('Koneksi')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Koneksi')} description={t('Status koneksi & integrasi.')} />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-semibold">{t('Markup Harga')}</div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                {t('Nilai ini akan ditambahkan ke harga layanan (per 1000).')}
                            </div>

                            <div className="mt-4 space-y-2">
                                <Label htmlFor="markup_amount">{t('Markup (Rp)')}</Label>
                                <Input
                                    id="markup_amount"
                                    inputMode="numeric"
                                    value={markupAmount}
                                    onChange={(e) => setMarkupAmount(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button type="button" onClick={saveMarkup}>
                                        {t('Simpan')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-semibold">{t('Medanpedia')}</div>
                            <div className="mt-2 text-sm">
                                {t('Status')}: {connections?.medanpedia?.configured ? t('Terkonfigurasi') : t('Belum dikonfigurasi')}
                            </div>

                            {connections?.medanpedia?.profile ? (
                                <pre className="mt-4 max-h-96 overflow-auto rounded-lg border bg-muted/20 p-3 text-xs">
                                    {JSON.stringify(connections.medanpedia.profile, null, 2)}
                                </pre>
                            ) : (
                                <div className="mt-4 text-xs text-muted-foreground">{t('Profil tidak tersedia.')}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-semibold">{t('Midtrans')}</div>
                            <div className="mt-2 text-sm">
                                {t('Status')}: {!connections?.midtrans?.enabled
                                    ? t('Dinonaktifkan sementara')
                                    : connections?.midtrans?.configured
                                        ? t('Terkonfigurasi')
                                        : t('Belum dikonfigurasi')}
                            </div>

                            <div className="mt-4 text-xs text-muted-foreground">
                                Env: {connections?.midtrans?.environment ?? 'sandbox'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-semibold">{t('Tripay')}</div>
                            <div className="mt-2 text-sm">
                                {t('Status')}: {!connections?.tripay?.enabled
                                    ? t('Dinonaktifkan sementara')
                                    : connections?.tripay?.configured
                                        ? t('Terkonfigurasi')
                                        : t('Belum dikonfigurasi')}
                            </div>

                            {!connections?.tripay?.enabled ? (
                                <div className="mt-4 text-xs text-muted-foreground">
                                    {t('Integrasi Tripay sedang dimatikan lewat konfigurasi aplikasi.')}
                                </div>
                            ) : null}

                            {connections?.tripay?.channels ? (
                                <pre className="mt-4 max-h-96 overflow-auto rounded-lg border bg-muted/20 p-3 text-xs">
                                    {JSON.stringify(connections.tripay.channels, null, 2)}
                                </pre>
                            ) : (
                                <div className="mt-4 text-xs text-muted-foreground">{t('Data channel tidak tersedia.')}</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminConnections.layout = {
    breadcrumbs: [
        {
            title: 'Koneksi',
            href: '/connections',
        },
    ],
};
