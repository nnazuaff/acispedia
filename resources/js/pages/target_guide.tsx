import { Head } from '@inertiajs/react';

import { useI18n } from '@/i18n/i18n-provider';
import { TargetGuideContent } from '@/pages/public/target-guide';

export default function TargetGuide() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Panduan Pengisian Target/Link')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <TargetGuideContent headingVariant="small" />
            </div>
        </>
    );
}
