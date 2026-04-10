import { Link } from '@inertiajs/react';
import { ChevronDown, Menu } from 'lucide-react';
import * as React from 'react';

import { AppearanceDropdown } from '@/components/appearance-dropdown';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { BrandLogoMark } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { dashboard, home, login, register } from '@/routes';
import type { RouteDefinition } from '@/wayfinder';

type NavItem = {
    label: string;
    href: string | RouteDefinition<any>;
};

const navItemsDefault: NavItem[] = [
    { label: 'Beranda', href: '#home' },
    { label: 'Layanan', href: '#services' },
    { label: 'Tentang', href: '#about' },
    { label: 'Kontak', href: '/kontak' },
];

const otherLinks: { label: string; href: string }[] = [
    { label: 'Bantuan', href: '/kontak' },
    { label: 'Contoh Pengisian Target', href: '/panduan-target' },
    { label: 'Ketentuan Layanan (S&K)', href: '/terms' },
];

export default function LandingNavbar({
    authUser,
    canRegister = true,
    navItems = navItemsDefault,
}: {
    authUser?: unknown;
    canRegister?: boolean;
    navItems?: NavItem[];
}) {
    const isAuthenticated = Boolean(authUser);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Link
                    href={home()}
                    className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="AcisPedia"
                >
                    <BrandLogoMark className="size-9" />
                    <span className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold">AcisPedia</span>
                        <span className="text-xs text-muted-foreground">
                            SMM Panel
                        </span>
                    </span>
                </Link>

                <nav className="ml-6 hidden items-center gap-1 md:flex">
                    {navItems.map((item) =>
                        typeof item.href === 'string' && item.href.startsWith('#') ? (
                            <a
                                key={item.href}
                                href={item.href}
                                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <Link
                                key={typeof item.href === 'string' ? item.href : item.href.url}
                                href={typeof item.href === 'string' ? item.href : item.href.url}
                                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {item.label}
                            </Link>
                        ),
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Lainnya
                                <ChevronDown className="ml-1 size-4" aria-hidden="true" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {otherLinks.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>

                <div className="ml-auto hidden items-center gap-2 md:flex">
                    <AppearanceDropdown />
                    {isAuthenticated ? (
                        <Button asChild>
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost">
                                <Link href={login()}>Login</Link>
                            </Button>
                            {canRegister && (
                                <Button asChild>
                                    <Link href={register()}>Register</Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-2 md:hidden">
                    <AppearanceDropdown />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open menu">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0">
                            <SheetHeader className="border-b">
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>

                            <div className="grid gap-1 p-4">
                                {navItems.map((item) =>
                                    typeof item.href === 'string' && item.href.startsWith('#') ? (
                                        <SheetClose asChild key={item.href}>
                                            <a
                                                href={item.href}
                                                className={cn(
                                                    'rounded-md px-3 py-2 text-sm font-medium',
                                                    'text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                )}
                                            >
                                                {item.label}
                                            </a>
                                        </SheetClose>
                                    ) : (
                                        <SheetClose
                                            asChild
                                            key={typeof item.href === 'string' ? item.href : item.href.url}
                                        >
                                            <Link
                                                href={typeof item.href === 'string' ? item.href : item.href.url}
                                                className={cn(
                                                    'rounded-md px-3 py-2 text-sm font-medium',
                                                    'text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ),
                                )}

                                <div className="mt-2 border-t pt-3">
                                    <div className="px-3 pb-1 text-xs font-semibold text-muted-foreground">
                                        Lainnya
                                    </div>
                                    <div className="grid gap-1">
                                        {otherLinks.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        'rounded-md px-3 py-2 text-sm font-medium',
                                                        'text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                    )}
                                                >
                                                    {item.label}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t p-4">
                                <div className="mb-4">
                                    <div className="mb-2 text-xs font-semibold text-muted-foreground">
                                        Tema
                                    </div>
                                    <AppearanceToggleTab className="w-full justify-between" />
                                </div>

                                {isAuthenticated ? (
                                    <SheetClose asChild>
                                        <Button asChild className="w-full">
                                            <Link href={dashboard()}>Dashboard</Link>
                                        </Button>
                                    </SheetClose>
                                ) : (
                                    <div className="grid gap-2">
                                        <SheetClose asChild>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={login()}>Login</Link>
                                            </Button>
                                        </SheetClose>
                                        {canRegister && (
                                            <SheetClose asChild>
                                                <Button asChild className="w-full">
                                                    <Link href={register()}>Register</Link>
                                                </Button>
                                            </SheetClose>
                                        )}
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
