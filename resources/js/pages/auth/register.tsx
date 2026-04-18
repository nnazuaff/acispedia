import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { Mail, Phone, RefreshCcw, ShieldCheck, User } from 'lucide-react';
import * as React from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/i18n/i18n-provider';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const { t } = useI18n();
    const [captchaKey, setCaptchaKey] = React.useState(() => String(Date.now()));
    const [captchaObjectUrl, setCaptchaObjectUrl] = React.useState<string | null>(null);

    setLayoutProps({
        title: t('Buat akun'),
        description: t(
            'Gunakan email dan nomor WhatsApp aktif untuk membuat akun AcisPedia.',
        ),
    });

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(
                    `/security-check?key=${encodeURIComponent(captchaKey)}`,
                    {
                        credentials: 'same-origin',
                        cache: 'no-store',
                        headers: {
                            Accept: 'image/svg+xml',
                        },
                    },
                );

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                }

                setCaptchaObjectUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
            } catch {
                // If it fails, keep previous image (or none).
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [captchaKey]);

    React.useEffect(() => {
        return () => {
            if (captchaObjectUrl) URL.revokeObjectURL(captchaObjectUrl);
        };
    }, [captchaObjectUrl]);

    return (
        <>
            <Head title={t('Daftar')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Nama')}</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <User className="size-4" />
                                    </div>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder={t('Nama lengkap')}
                                        className="pl-10"
                                    />
                                </div>
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('Email')}</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Mail className="size-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder={t('Contoh: email@example.com')}
                                        className="pl-10"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    {t('Nomor HP / WhatsApp')}
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Phone className="size-4" />
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        tabIndex={3}
                                        autoComplete="tel"
                                        name="phone"
                                        inputMode="tel"
                                        placeholder={t('Contoh: 08xxxxxxxxxx')}
                                        className="pl-10"
                                    />
                                </div>
                                <InputError message={(errors as any).phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">{t('Kata sandi')}</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={t(
                                        'Minimal 8 karakter (angka & simbol)',
                                    )}
                                    leftIcon={<ShieldCheck className="size-4" />}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('Konfirmasi kata sandi')}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder={t('Ulangi kata sandi')}
                                    leftIcon={<ShieldCheck className="size-4" />}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="security_check">
                                    {t('Cek Keamanan')}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex h-10 w-35 items-center justify-center overflow-hidden rounded-md border bg-background"
                                        style={
                                            captchaObjectUrl
                                                ? {
                                                      backgroundImage: `url(${captchaObjectUrl})`,
                                                      backgroundRepeat: 'no-repeat',
                                                      backgroundPosition: 'center',
                                                  }
                                                : undefined
                                        }
                                        onContextMenu={(e) => e.preventDefault()}
                                        aria-hidden
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCaptchaKey(String(Date.now()))}
                                        aria-label={t('Muat ulang cek keamanan')}
                                    >
                                        <RefreshCcw className="size-4" />
                                    </Button>
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                    <Input
                                        id="security_check"
                                        type="text"
                                        required
                                        tabIndex={6}
                                        name="security_check"
                                        autoComplete="off"
                                        placeholder={t('Masukkan kode di atas')}
                                        className="pl-10"
                                    />
                                </div>
                                <InputError message={(errors as any).security_check} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={7}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {t('Buat akun')}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('Sudah punya akun?')}{' '}
                            <TextLink href={login()} tabIndex={8}>
                                {t('Masuk')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Buat akun',
    description:
        'Gunakan email dan nomor WhatsApp aktif untuk membuat akun AcisPedia.',
};
