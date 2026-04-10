import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import LandingNavbar from '@/components/landing/landing-navbar';
import { home, services } from '@/routes';
import type { RouteDefinition } from '@/wayfinder';

type NavItem = {
    label: string;
    href: string | RouteDefinition<any>;
};

export default function GuestLayout({ children }: { children: ReactNode }) {
    const page = usePage();
    const authUser = (page.props as any)?.auth?.user;
    const canRegister = (page.props as any)?.canRegister ?? true;

    const navItems: NavItem[] = [
        { label: 'Beranda', href: home() },
        { label: 'Layanan', href: services() },
        { label: 'Kontak', href: '/kontak' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar authUser={authUser} canRegister={canRegister} navItems={navItems} />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
