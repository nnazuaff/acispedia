import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { useI18n } from '@/i18n/i18n-provider';

export default function AdminOrders() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Pesanan')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Pesanan')}
                    description={t('Manajemen pesanan admin.')}
                />
            </div>
        </>
    );
}

AdminOrders.layout = {
    breadcrumbs: [
        {
            title: 'Pesanan',
            href: '/orders',
        },
    ],
};
