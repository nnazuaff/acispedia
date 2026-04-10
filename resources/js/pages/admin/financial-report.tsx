import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { useI18n } from '@/i18n/i18n-provider';

export default function AdminFinancialReport() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Laporan Keuangan')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Laporan Keuangan')}
                    description={t('Halaman ini akan menampilkan ringkasan keuangan.')}
                />
            </div>
        </>
    );
}

AdminFinancialReport.layout = {
    breadcrumbs: [
        {
            title: 'Laporan Keuangan',
            href: '/financial-report',
        },
    ],
};
