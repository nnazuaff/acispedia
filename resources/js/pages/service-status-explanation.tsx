import { Head } from '@inertiajs/react';
import { ServiceStatusExplanationContent } from '@/pages/public/service-status-explanation';
import { useI18n } from '@/i18n/i18n-provider';

export default function ServiceStatusExplanationPage() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Penjelasan Status Layanan')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ServiceStatusExplanationContent headingVariant="small" />
            </div>
        </>
    );
}
