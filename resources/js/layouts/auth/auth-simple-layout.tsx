import { Link, usePage } from '@inertiajs/react';
import { CreditCard, ShieldCheck, UserPlus } from 'lucide-react';
import { BrandLogoMark } from '@/components/brand-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { t } = useI18n();
    const page = usePage();
    const component = (page as any)?.component as string | undefined;
    const isSplitAuth =
        component === 'auth/login' ||
        component === 'auth/register' ||
        component === 'auth/forgot-password';

    if (isSplitAuth) {
        return (
            <div className="min-h-svh bg-background">
                <div className="grid min-h-svh lg:grid-cols-2">
                    <div className="relative hidden lg:flex lg:flex-col lg:justify-center lg:border-r lg:bg-muted/10">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0 opacity-35 acis-grid-drift bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--color-foreground)_12%,transparent)_1px,transparent_0)] bg-size-[22px_22px]" />
                        </div>

                        <div className="mx-auto w-full max-w-lg px-10">
                            <Link href={home()} className="mb-10 inline-flex items-center gap-2 font-medium acis-fade-up">
                                <BrandLogoMark className="size-9" />
                                <span>AcisPedia</span>
                            </Link>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold tracking-tight acis-fade-up acis-delay-1">
                                    {t('Solusi Terpadu Untuk SMM Panel')}
                                </h2>
                                <p className="text-sm text-muted-foreground acis-fade-up acis-delay-2">
                                    {t(
                                        'Kelola layanan, deposit, dan order dalam satu dashboard.',
                                    )}
                                </p>
                            </div>

                            <div className="mt-8 grid gap-3">
                                <Card className="acis-fade-up acis-delay-3">
                                    <CardContent className="flex items-center gap-3 pt-6">
                                        <UserPlus className="size-5 text-primary" />
                                        <div className="leading-tight">
                                            <div className="text-sm font-medium">
                                                {t('Daftar Akun')}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {t(
                                                    'Registrasi cepat menggunakan email & WhatsApp aktif.',
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="acis-fade-up [animation-delay:420ms]">
                                    <CardContent className="flex items-center gap-3 pt-6">
                                        <CreditCard className="size-5 text-primary" />
                                        <div className="leading-tight">
                                            <div className="text-sm font-medium">
                                                {t('Deposit Saldo')}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {t(
                                                    'Isi saldo dan mulai transaksi kapan saja.',
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="acis-fade-up [animation-delay:520ms]">
                                    <CardContent className="flex items-center gap-3 pt-6">
                                        <ShieldCheck className="size-5 text-primary" />
                                        <div className="leading-tight">
                                            <div className="text-sm font-medium">
                                                {t('Akun Lebih Aman')}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {t(
                                                    'Gunakan kata sandi kuat untuk melindungi akun.',
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 md:p-10">
                        <div className="absolute right-4 top-4">
                            <LanguageSwitcher compact />
                        </div>

                        <div className="w-full max-w-sm">
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col items-center gap-4 lg:hidden">
                                    <Link
                                        href={home()}
                                        className="flex flex-col items-center gap-2 font-medium"
                                    >
                                        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                            <BrandLogoMark className="size-9" />
                                        </div>
                                        <span className="sr-only">{title}</span>
                                    </Link>
                                </div>

                                <div className="space-y-2 text-center">
                                    <h1 className="text-xl font-medium">{title}</h1>
                                    <p className="text-center text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                </div>

                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                <BrandLogoMark className="size-9" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
