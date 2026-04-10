import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';

type ConnectionsPayload = {
    connections: {
        medanpedia: {
            configured: boolean;
            profile: unknown;
        };
        tripay: {
            configured: boolean;
            channels: unknown;
        };
    };
};

export default function AdminConnections() {
    const { t } = useI18n();
    const { connections } = usePage().props as any as ConnectionsPayload;

    return (
        <>
            <Head title={t('Koneksi')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Koneksi')} description={t('Status koneksi & integrasi.')} />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-semibold">Medanpedia</div>
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
                            <div className="text-sm font-semibold">Tripay</div>
                            <div className="mt-2 text-sm">
                                {t('Status')}: {connections?.tripay?.configured ? t('Terkonfigurasi') : t('Belum dikonfigurasi')}
                            </div>

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
