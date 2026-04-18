import { Head, useForm, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
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

type Category = { value: string; label: string };

type PageProps = {
    defaults: {
        name: string;
        phone: string;
    };
    categories: Category[];
};

export default function KotakSaran() {
    const { t } = useI18n();
    const page = usePage<PageProps>();
    const defaults = page.props.defaults;
    const categories = page.props.categories ?? [];

    const { data, setData, post, processing, errors, reset } = useForm({
        name: defaults?.name ?? '',
        phone: defaults?.phone ?? '',
        category: '',
        message: '',
    });

    return (
        <>
            <Head title="Kotak Saran" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title={t('Kotak Saran')} description={t('Kirim saran atau keluhan Anda.')} />

                <Card>
                    <CardContent className="pt-6">
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                post('/kotak-saran', {
                                    onSuccess: () => {
                                        reset('category', 'message');
                                        toast.success(t('Saran berhasil dikirim.'));
                                    },
                                });
                            }}
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('Nama')}</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('Nama')}
                                    />
                                    {errors.name && (
                                        <div className="text-xs text-destructive">{errors.name}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('Nomor HP/WA')}</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                    {errors.phone && (
                                        <div className="text-xs text-destructive">{errors.phone}</div>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>{t('Kategori')}</Label>
                                    <Select
                                        value={data.category || undefined}
                                        onValueChange={(v) => setData('category', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Pilih kategori')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <div className="text-xs text-destructive">{errors.category}</div>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="message">{t('Saran')}</Label>
                                    <textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        rows={7}
                                        className="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive md:text-sm"
                                        placeholder={t('Tulis saran Anda...')}
                                    />
                                    {errors.message && (
                                        <div className="text-xs text-destructive">{errors.message}</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('Mengirim...') : t('Kirim')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
