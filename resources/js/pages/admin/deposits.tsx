import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { useI18n } from '@/i18n/i18n-provider';

export default function AdminDeposits() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Deposit')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Deposit')}
                    description={t('Manajemen deposit admin.')}
                />
            </div>
        </>
    );
}

AdminDeposits.layout = {
    breadcrumbs: [
        {
            title: 'Deposit',
            href: '/deposits',
        },
    ],
};
