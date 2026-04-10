import { Head } from '@inertiajs/react';

import { TermsContent } from '@/pages/public/terms';

export default function Terms() {
    return (
        <>
            <Head title="Syarat & Ketentuan" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <TermsContent headingVariant="small" />
            </div>
        </>
    );
}
