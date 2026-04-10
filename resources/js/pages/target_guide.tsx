import { Head } from '@inertiajs/react';

import { TargetGuideContent } from '@/pages/public/target-guide';

export default function TargetGuide() {
    return (
        <>
            <Head title="Panduan Pengisian Target/Link" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <TargetGuideContent headingVariant="small" />
            </div>
        </>
    );
}
