import { Head, setLayoutProps } from '@inertiajs/react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/i18n-provider';

export default function Verified() {
    const { t } = useI18n();

    setLayoutProps({
        title: t('Konfirmasi berhasil'),
        description: t('Email berhasil diverifikasi.'),
    });

    React.useEffect(() => {
        const t = window.setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);

        return () => window.clearTimeout(t);
    }, []);

    return (
        <>
            <Head title={t('Konfirmasi berhasil')} />

            <div className="space-y-3 text-center">
                <h2 className="text-lg font-semibold">
                    {t('Konfirmasi berhasil')}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t(
                        'Email Anda sudah terverifikasi. Anda akan diarahkan ke dashboard.',
                    )}
                </p>
                <Button onClick={() => (window.location.href = '/dashboard')}>
                    {t('Masuk ke dashboard')}
                </Button>
            </div>
        </>
    );
}
