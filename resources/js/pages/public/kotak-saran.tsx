import { Head, Link, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';
import { login, register } from '@/routes';

type PageProps = {
    canRegister?: boolean;
};

export default function PublicKotakSaran() {
    const { t } = useI18n();
    const page = usePage<PageProps>();
    const canRegister = Boolean(page.props.canRegister ?? true);

    return (
        <>
            <Head title={t('Kotak Saran')} />

            <div className="mx-auto w-full max-w-5xl space-y-6">
                <Heading title={t('Kotak Saran')} description={t('Kirim saran atau keluhan Anda.')} />

                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <p className="text-sm text-muted-foreground">
                            {t('Silakan masuk untuk mengirim saran melalui form Kotak Saran.')}
                        </p>

                        <div className="flex flex-wrap justify-end gap-2">
                            {canRegister && (
                                <Button asChild variant="outline">
                                    <Link href={register()}>{t('Daftar')}</Link>
                                </Button>
                            )}
                            <Button asChild>
                                <Link href={login()}>{t('Masuk')}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
