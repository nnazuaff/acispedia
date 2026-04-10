import { Form, Head, Link } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/i18n-provider';

export default function AdminUserCreate() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Tambah Pengguna')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Tambah Pengguna')} description={t('Buat akun user baru.')} />

                <Card>
                    <CardContent className="pt-6">
                        <Form action="/users" method="post" className="grid gap-4 md:max-w-xl">
                            {() => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">{t('Nama')}</Label>
                                        <Input id="name" name="name" required />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">{t('Email')}</Label>
                                        <Input id="email" name="email" type="email" required />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">{t('Telepon')}</Label>
                                        <Input id="phone" name="phone" placeholder="08xxxxxxxxxx" />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">{t('Password')}</Label>
                                        <Input id="password" name="password" type="password" autoComplete="new-password" required />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">{t('Konfirmasi Password')}</Label>
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                        />
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

AdminUserCreate.layout = {
    breadcrumbs: [
        { title: 'Pengguna', href: '/users' },
        { title: 'Tambah', href: '#' },
    ],
};
