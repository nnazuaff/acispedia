import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import FlashToasts from '@/components/flash-toasts';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <FlashToasts />
            {children}
        </AppLayoutTemplate>
    );
}
