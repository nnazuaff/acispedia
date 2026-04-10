import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';

type AdminEmailRow = {
    email: string;
    exists: boolean;
    user: {
        id: number;
        name: string;
        email: string;
        created_at_wib: string | null;
    } | null;
};

export default function AdminAdminUsers() {
    const { t } = useI18n();
    const { admin_emails } = usePage().props as any as { admin_emails: AdminEmailRow[] };

    const rows = Array.isArray(admin_emails) ? admin_emails : [];

    return (
        <>
            <Head title={t('Admin')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Admin')} description={t('Daftar email admin dari allowlist.') } />

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">
                            {t('Sumber data')}: <span className="font-medium">ADMIN_EMAILS</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Email')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Status')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('User ID')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Nama')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dibuat')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.email} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">{row.email}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {row.exists ? t('Terdaftar') : t('Belum terdaftar')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.user?.id ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.user?.name ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.user?.created_at_wib ?? '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminAdminUsers.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin-users',
        },
    ],
};
