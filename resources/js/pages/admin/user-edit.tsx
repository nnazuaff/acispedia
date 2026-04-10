import { Form, Head, Link, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/i18n-provider';

type UserEdit = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
};

export default function AdminUserEdit() {
    const { t } = useI18n();

    const { user } = usePage().props as any as {
        user: UserEdit;
    };

    return (
        <>
            <Head title={`${t('Edit Pengguna')} #${user?.id ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Edit Pengguna')} description={`#${user?.id ?? '-'}`} />

                <Card>
                    <CardContent className="pt-6">
                        <Form action={`/users/${user.id}`} method="put" className="grid gap-4 md:max-w-xl">
                            {() => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">{t('Nama')}</Label>
                                        <Input id="name" name="name" defaultValue={user?.name ?? ''} required />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">{t('Email')}</Label>
                                        <Input id="email" name="email" defaultValue={user?.email ?? ''} required />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">{t('Telepon')}</Label>
                                        <Input id="phone" name="phone" defaultValue={user?.phone ?? ''} placeholder="08xxxxxxxxxx" />
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Button type="submit">{t('Simpan')}</Button>
                                        <Button asChild variant="outline">
                                            <Link href="/users" prefetch>
                                                {t('Batal')}
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminUserEdit.layout = {
    breadcrumbs: [
        { title: 'Pengguna', href: '/users' },
        { title: 'Edit', href: '#' },
    ],
};
