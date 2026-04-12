import { Form, Head, Link, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n/i18n-provider';

type UserEdit = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    account_status: 'active' | 'inactive' | 'banned' | string;
};

export default function AdminUserEdit() {
    const { t } = useI18n();

    const { user } = usePage().props as any as {
        user: UserEdit;
    };

    const [accountStatus, setAccountStatus] = React.useState<string>(String(user?.account_status ?? 'active'));

    React.useEffect(() => {
        setAccountStatus(String(user?.account_status ?? 'active'));
    }, [user?.account_status]);

    return (
        <>
            <Head title={`${t('Edit Pengguna')} #${user?.id ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Edit Pengguna')} description={`#${user?.id ?? '-'}`} />

                <Card>
                    <CardContent className="pt-6">
                        <Form action={`/users/${user.id}`} method="put" className="grid gap-4 md:max-w-xl">
                            {({ errors, processing }) => (
                                <>
                                    <input type="hidden" name="account_status" value={accountStatus} />

                                    <div className="grid gap-2">
                                        <Label htmlFor="name">{t('Nama')}</Label>
                                        <Input id="name" name="name" defaultValue={user?.name ?? ''} required />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">{t('Email')}</Label>
                                        <Input id="email" name="email" defaultValue={user?.email ?? ''} required />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">{t('Telepon')}</Label>
                                        <Input id="phone" name="phone" defaultValue={user?.phone ?? ''} placeholder="08xxxxxxxxxx" />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>{t('Status Akun')}</Label>
                                        <Select value={accountStatus} onValueChange={setAccountStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('Pilih')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">{t('Aktif')}</SelectItem>
                                                <SelectItem value="inactive">{t('Nonaktif')}</SelectItem>
                                                <SelectItem value="banned">{t('Banned')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.account_status} />
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Button type="submit" disabled={processing}>
                                            {t('Simpan')}
                                        </Button>
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
