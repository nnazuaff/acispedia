import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ChevronDown,
    CircleHelp,
    CreditCard,
    FileText,
    History,
    LayoutGrid,
    Layers,
    ListChecks,
    ShoppingCart,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useI18n } from '@/i18n/i18n-provider';
import { dashboard, home } from '@/routes';
import type { NavItem } from '@/types';

const userMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Layanan',
        href: '/services',
        icon: Layers,
    },
];

const adminMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Riwayat Pesanan',
        href: '/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Riwayat Deposit',
        href: '/deposits',
        icon: CreditCard,
    },
    {
        title: 'Pengguna',
        href: '/users',
        icon: Users,
    },
];

export function AppSidebar() {
    const page = usePage();
    const url = (page as any)?.url as string | undefined;
    const isHistoryActive = (url ?? '').startsWith('/history');
    const isAdminArea = Boolean((page.props as any)?.isAdminArea);
    const { t } = useI18n();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={home()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={isAdminArea ? adminMainNavItems : userMainNavItems} />

                {isAdminArea ? (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>{t('Sistem')}</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: t('Laporan Keuangan') }}
                                >
                                    <Link href="/financial-report" prefetch>
                                        <FileText />
                                        <span>{t('Laporan Keuangan')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: t('Penjelasan Status Layanan') }}
                                >
                                    <Link href="/penjelasan-status-layanan" prefetch>
                                        <CircleHelp />
                                        <span>{t('Penjelasan Status Layanan')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={{ children: t('Koneksi') }}>
                                    <Link href="/connections" prefetch>
                                        <Layers />
                                        <span>{t('Koneksi')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: t('Log Aktivitas') }}
                                >
                                    <Link href="/activity-logs" prefetch>
                                        <Activity />
                                        <span>{t('Log Aktivitas')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: t('Log Aktivitas User') }}
                                >
                                    <Link href="/user-activity-logs" prefetch>
                                        <Activity />
                                        <span>{t('Log Aktivitas User')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                ) : (
                    <>

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>{t('Transaksi')}</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: t('Isi Saldo') }}
                            >
                                <Link href="/deposit" prefetch>
                                    <CreditCard />
                                    <span>{t('Deposit Saldo')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{ children: t('Order') }}>
                                <Link href="/order" prefetch>
                                    <ShoppingCart />
                                    <span>{t('Order')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <Collapsible defaultOpen={isHistoryActive} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={{ children: t('Riwayat') }}>
                                        <History />
                                        <span>{t('Riwayat')}</span>
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild>
                                                <Link href="/history/deposit" prefetch>
                                                    <span>{t('Riwayat Deposit')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>

                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild>
                                                <Link href="/history/transaction" prefetch>
                                                    <span>{t('Riwayat Transaksi')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>{t('Lainnya')}</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{ children: t('Bantuan') }}>
                                <Link href="/contact" prefetch>
                                    <CircleHelp />
                                    <span>{t('Bantuan')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: t('Penjelasan Status Layanan') }}
                            >
                                <Link href="/penjelasan-status-layanan" prefetch>
                                    <CircleHelp />
                                    <span>{t('Penjelasan Status Layanan')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: t('Contoh Pengisian Target') }}
                            >
                                <Link href="/panduan-target" prefetch>
                                    <ListChecks />
                                    <span>{t('Contoh Pengisian Target')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: t('Ketentuan Layanan') }}
                            >
                                <Link href="/terms" prefetch>
                                    <FileText />
                                    <span>{t('Ketentuan Layanan')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                    </>
                )}
            </SidebarContent>
        </Sidebar>
    );
}
