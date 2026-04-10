import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';

type Props = {
    app: {
        env: string;
        debug: boolean;
    };
    queue: {
        connection: string;
        active_hint: boolean;
        pending_jobs: number | null;
        failed_jobs: number | null;
        size_hint: number | null;
    };
    reverb: {
        broadcast_driver: string;
        configured: boolean;
        app: {
            app_id: string | null;
            key_set: boolean;
            secret_set: boolean;
        };
        server: {
            name: string;
            host: string;
            port: number;
        };
        tcp: {
            ok: boolean | null;
            error: string | null;
        };
    };
};

function statusLabel(ok: boolean | null): string {
    if (ok === null) return '-';
    return ok ? 'OK' : 'ERROR';
}

export default function AdminSystemStatus() {
    const { t } = useI18n();
    const { app, queue, reverb } = usePage().props as any as Props;

    return (
        <>
            <Head title={t('Status Sistem')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Status Sistem')} description={t('Pengecekan sederhana untuk Queue & Reverb.')} />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>{t('Aplikasi')}</CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('ENV')}</div>
                                <div className="font-medium">{app?.env || '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Debug')}</div>
                                <div className="font-medium">{app?.debug ? t('Ya') : t('Tidak')}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>{t('Queue')}</CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Connection')}</div>
                                <div className="font-medium">{queue?.connection || '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Aktif (indikasi)')}</div>
                                <div className="font-medium">{queue?.active_hint ? 'OK' : 'OFF'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Pending Jobs')}</div>
                                <div className="font-medium">{queue?.pending_jobs ?? '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Failed Jobs')}</div>
                                <div className="font-medium">{queue?.failed_jobs ?? '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Queue Size (hint)')}</div>
                                <div className="font-medium">{queue?.size_hint ?? '-'}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>{t('Reverb')}</CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Broadcast Driver')}</div>
                                <div className="font-medium">{reverb?.broadcast_driver || '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Credential Lengkap')}</div>
                                <div className="font-medium">{reverb?.configured ? 'OK' : 'MISSING'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('App ID')}</div>
                                <div className="font-medium">{reverb?.app?.app_id ?? '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Key')}</div>
                                <div className="font-medium">{reverb?.app?.key_set ? 'SET' : 'MISSING'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Secret')}</div>
                                <div className="font-medium">{reverb?.app?.secret_set ? 'SET' : 'MISSING'}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>{t('Reverb Server')}</CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Server')}</div>
                                <div className="font-medium">{reverb?.server?.name || '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Host')}</div>
                                <div className="font-medium">{reverb?.server?.host || '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('Port')}</div>
                                <div className="font-medium">{reverb?.server?.port ?? '-'}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-muted-foreground">{t('TCP Check')}</div>
                                <div className="font-medium">{statusLabel(reverb?.tcp?.ok ?? null)}</div>
                            </div>
                            {reverb?.tcp?.error ? (
                                <div className="text-xs text-muted-foreground">{reverb.tcp.error}</div>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminSystemStatus.layout = {
    breadcrumbs: [
        {
            title: 'Status Sistem',
            href: '/system-status',
        },
    ],
};
