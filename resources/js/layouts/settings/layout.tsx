import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { ShieldCheck, Smartphone, User } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useI18n } from '@/i18n/i18n-provider';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useI18n();
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const sidebarNavItems: NavItem[] = [
        {
            title: t('Profil'),
            href: edit(),
            icon: User,
        },
        {
            title: t('Keamanan'),
            href: editSecurity(),
            icon: ShieldCheck,
        },
        {
            title: t('Perangkat'),
            href: '/settings/devices',
            icon: Smartphone,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading
                title={t('Pengaturan')}
                description={t('Kelola profil dan pengaturan akun Anda.')}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label={t('Pengaturan')}
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
