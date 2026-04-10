import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { useI18n } from '@/i18n/i18n-provider';

export default function AdminActivityLogs() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Log Aktivitas')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Log Aktivitas')}
                    description={t('Riwayat aktivitas di area admin.')}
                />
            </div>
        </>
    );
}

AdminActivityLogs.layout = {
    breadcrumbs: [
        {
            title: 'Log Aktivitas',
            href: '/activity-logs',
        },
    ],
};
