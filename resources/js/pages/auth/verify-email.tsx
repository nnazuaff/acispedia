// Components
import { Form, Head, setLayoutProps } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/i18n/i18n-provider';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useI18n();

    setLayoutProps({
        title: t('Verifikasi email'),
        description: t(
            'Silakan verifikasi alamat email Anda dengan mengklik link yang baru saja kami kirimkan.',
        ),
    });

    return (
        <>
            <Head title={t('Verifikasi email')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {t(
                        'Link verifikasi baru telah dikirim ke alamat email yang Anda berikan saat registrasi.',
                    )}
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            {t('Kirim ulang email verifikasi')}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            {t('Keluar')}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}
