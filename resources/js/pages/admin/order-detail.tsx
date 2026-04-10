import { Form, Head, Link, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n/i18n-provider';

type OrderDetail = {
    id: number;
    created_at_wib: string | null;
    updated_at_wib: string | null;
    service_id: number;
    service_name: string;
    target: string;
    comments: string | null;
    quantity: number;
    base_price: number;
    price_per_1000: number;
    total_price: number;
    status: string;
    provider_order_id: string | null;
    start_count: number | null;
    remains: number | null;
    charge: number | null;
    last_status_check_wib: string | null;
    status_check_attempts: number;
    user: {
        id: number;
        name: string | null;
        email: string | null;
    };
};

type KnownStatuses = Record<string, string>;

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminOrderDetail() {
    const { t } = useI18n();

    const { order, known_statuses } = usePage().props as any as {
        order: OrderDetail;
        known_statuses: KnownStatuses;
    };

    const statusOptions = React.useMemo(() => {
        const entries = Object.entries(known_statuses ?? {});
        return entries.length > 0 ? entries : [];
    }, [known_statuses]);

    const currentKey = React.useMemo(() => {
        const current = String(order?.status ?? '').toLowerCase();
        for (const [key, label] of statusOptions) {
            if (String(label).toLowerCase() === current) {
                return key;
            }
        }
        return 'pending';
    }, [order?.status, statusOptions]);

    const [statusKey, setStatusKey] = React.useState<string>(currentKey);

    React.useEffect(() => {
        setStatusKey(currentKey);
    }, [currentKey]);

    return (
        <>
            <Head title={`${t('Detail Pesanan')} #${order?.id ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    variant="small"
                    title={t('Detail Pesanan')}
                    description={`#${order?.id ?? '-'}`}
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action={`/orders/${order.id}/status`}
                            method="post"
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                            {() => (
                                <>
                                    <div className="w-full sm:max-w-xs">
                                        <Label>{t('Status')}</Label>
                                        <Select value={statusKey} onValueChange={setStatusKey}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="status" value={statusKey} />
                                    </div>

                                    <Button type="submit">{t('Perbarui Status')}</Button>

                                    <Button asChild variant="outline">
                                        <Link href="/orders" prefetch>
                                            {t('Kembali')}
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Kolom')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Nilai')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('ID')}</td>
                                        <td className="px-4 py-3">#{order.id}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Pengguna')}</td>
                                        <td className="px-4 py-3">
                                            {order.user?.name || order.user?.email || '-'}
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Layanan')}</td>
                                        <td className="px-4 py-3">{order.service_name || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Target / Tautan')}</td>
                                        <td className="px-4 py-3">
                                            <span className="break-all">{order.target || '-'}</span>
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Jumlah')}</td>
                                        <td className="px-4 py-3">{formatNumber(order.quantity ?? 0)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Total')}</td>
                                        <td className="px-4 py-3">Rp {formatNumber(order.total_price ?? 0)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Status')}</td>
                                        <td className="px-4 py-3">{order.status || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Dibuat')}</td>
                                        <td className="px-4 py-3">{order.created_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Diperbarui')}</td>
                                        <td className="px-4 py-3">{order.updated_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Provider Order ID')}</td>
                                        <td className="px-4 py-3">{order.provider_order_id ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Cek Status Terakhir')}</td>
                                        <td className="px-4 py-3">{order.last_status_check_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Jumlah Percobaan Cek Status')}</td>
                                        <td className="px-4 py-3">{formatNumber(order.status_check_attempts ?? 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {order.comments ? (
                            <div className="mt-4">
                                <div className="text-sm font-semibold">{t('Comments')}</div>
                                <pre className="mt-2 max-h-72 overflow-auto rounded-lg border bg-muted/20 p-3 text-xs">
                                    {order.comments}
                                </pre>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminOrderDetail.layout = {
    breadcrumbs: [
        { title: 'Pesanan', href: '/orders' },
        { title: 'Detail', href: '#' },
    ],
};
