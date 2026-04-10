import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { useI18n } from '@/i18n/i18n-provider';

export default function AdminServices() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Layanan')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Layanan')}
                    description={t('Manajemen layanan admin.')}
                />
            </div>
        </>
    );
}

AdminServices.layout = {
    breadcrumbs: [
        {
            title: 'Layanan',
            href: '/services',
        },
    ],
};
