import { Head, router } from '@inertiajs/react';

import { useConfirm } from '@/components/confirm-dialog-provider';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DeviceSession = {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    last_activity_at: string | null;
    is_current: boolean;
};

function fmtWib(iso: string | null): string {
    if (!iso) return '-';

    try {
        const dtf = new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta',
        });

        return `${dtf.format(new Date(iso))} WIB`;
    } catch {
        return iso;
    }
}

export default function DevicesPage({ sessions }: { sessions: DeviceSession[] }) {
    const confirm = useConfirm();

    const logoutAllOther = async () => {
        const ok = await confirm({
            title: 'Logout perangkat lain',
            description: 'Logout dari semua perangkat lain?',
            confirmText: 'Logout',
            cancelText: 'Batal',
            variant: 'destructive',
        });
        if (!ok) return;

        router.delete('/settings/devices', {
            preserveScroll: true,
        });
    };

    const logoutSession = async (id: string) => {
        const ok = await confirm({
            title: 'Logout perangkat',
            description: 'Logout perangkat ini?',
            confirmText: 'Logout',
            cancelText: 'Batal',
            variant: 'destructive',
        });
        if (!ok) return;

        router.delete(`/settings/devices/${encodeURIComponent(id)}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Devices" />

            <h1 className="sr-only">Devices</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Devices"
                    description="Perangkat yang sedang login ke akun Anda"
                />

                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="destructive" onClick={logoutAllOther}>
                        Logout semua perangkat lain
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sesi Login</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sessions.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Tidak ada sesi.</div>
                        ) : (
                            sessions.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            {s.is_current ? 'Perangkat ini' : 'Perangkat lain'}
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            IP: {s.ip_address ?? '-'}
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Terakhir aktif: {fmtWib(s.last_activity_at)}
                                        </div>
                                        {s.user_agent ? (
                                            <div className="mt-1 wrap-break-word text-xs text-muted-foreground">
                                                {s.user_agent}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={s.is_current}
                                            onClick={() => logoutSession(s.id)}
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DevicesPage.layout = {
    breadcrumbs: [
        {
            title: 'Devices',
            href: '/settings/devices',
        },
    ],
};
