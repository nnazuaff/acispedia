import { Form, Head, setLayoutProps } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/i18n/i18n-provider';
import { update } from '@/routes/password';
import { request } from '@/routes/password';

type Props = {
    token?: string | null;
    email?: string | null;
};

export default function ResetPassword({ token, email }: Props) {
    const { t } = useI18n();
    const isValid = !!token && !!email;

    setLayoutProps({
        title: t('Reset kata sandi'),
        description: t('Silakan masukkan kata sandi baru Anda di bawah ini'),
    });

    return (
        <>
            <Head title={t('Reset kata sandi')} />

            {!isValid && (
                <div className="mb-4 rounded-md border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                    {t(
                        'Link reset kata sandi tidak valid atau sudah kedaluwarsa. Silakan minta link baru.',
                    )}
                    <div className="mt-2">
                        <TextLink href={request()} className="text-sm">
                            {t('Minta link reset kata sandi')}
                        </TextLink>
                    </div>
                </div>
            )}

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token: token ?? '', email: email ?? '' })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email ?? ''}
                                className="mt-1 block w-full"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('Kata sandi')}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                autoFocus
                                placeholder={t('Kata sandi')}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                {t('Konfirmasi kata sandi')}
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                placeholder={t('Konfirmasi kata sandi')}
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={processing || !isValid}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            {t('Reset kata sandi')}
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}
