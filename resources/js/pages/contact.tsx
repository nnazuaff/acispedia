import { Head } from '@inertiajs/react';

import { useI18n } from '@/i18n/i18n-provider';
import { ContactContent } from '@/pages/public/contact';

export default function Contact() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Kontak')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ContactContent headingVariant="small" />
            </div>
        </>
    );
}
