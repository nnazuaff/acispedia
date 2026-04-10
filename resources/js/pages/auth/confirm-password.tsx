import { Form, Head, setLayoutProps } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/i18n/i18n-provider';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useI18n();

    setLayoutProps({
        title: t('Konfirmasi kata sandi'),
        description: t(
            'Ini adalah area aman aplikasi. Silakan konfirmasi kata sandi Anda sebelum melanjutkan.',
        ),
    });

    return (
        <>
            <Head title={t('Konfirmasi kata sandi')} />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('Kata sandi')}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={t('Kata sandi')}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t('Konfirmasi kata sandi')}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}
