import { Head } from '@inertiajs/react';

import { TermsContent } from '@/pages/public/terms';
import { useI18n } from '@/i18n/i18n-provider';

export default function Terms() {
    const { t } = useI18n();
    return (
        <>
            <Head title={t('Syarat & Ketentuan')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <TermsContent headingVariant="small" />
            </div>
        </>
    );
}
