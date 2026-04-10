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

type DepositDetail = {
    id: number;
    amount: number;
    final_amount: number;
    status: string;
    payment_method: string;
    tripay_merchant_ref: string | null;
    tripay_reference: string | null;
    tripay_method: string | null;
    tripay_pay_code: string | null;
    tripay_checkout_url: string | null;
    tripay_status: string | null;
    expired_at_wib: string | null;
    processed_at_wib: string | null;
    created_at_wib: string | null;
    updated_at_wib: string | null;
    user: {
        id: number;
        name: string | null;
        email: string | null;
    };
    provider_payload: unknown;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminDepositDetail() {
    const { t } = useI18n();

    const { deposit, known_statuses } = usePage().props as any as {
        deposit: DepositDetail;
        known_statuses: string[];
    };

    const statusOptions = React.useMemo(() => {
        return Array.isArray(known_statuses) ? known_statuses : [];
    }, [known_statuses]);

    const [nextStatus, setNextStatus] = React.useState<string>(String(deposit?.status ?? 'pending'));

    React.useEffect(() => {
        setNextStatus(String(deposit?.status ?? 'pending'));
    }, [deposit?.status]);

    return (
        <>
            <Head title={`${t('Detail Deposit')} #${deposit?.id ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Detail Deposit')} description={`#${deposit?.id ?? '-'}`} />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action={`/deposits/${deposit.id}/status`}
                            method="post"
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                            {() => (
                                <>
                                    <div className="w-full sm:max-w-xs">
                                        <Label>{t('Status')}</Label>
                                        <Select value={nextStatus} onValueChange={setNextStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((st) => (
                                                    <SelectItem key={st} value={st}>
                                                        {st}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="status" value={nextStatus} />
                                    </div>

                                    <Button type="submit">{t('Perbarui Status')}</Button>

                                    <Button asChild variant="outline">
                                        <Link href="/deposits" prefetch>
                                            {t('Kembali')}
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="mt-4 text-xs text-muted-foreground">
                            {t('Catatan')}: {t('Status sukses hanya bisa diset dari pending, dan tidak bisa diturunkan.')}
                        </div>
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
                                        <td className="px-4 py-3">#{deposit.id}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Pengguna')}</td>
                                        <td className="px-4 py-3">{deposit.user?.name || deposit.user?.email || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Jumlah')}</td>
                                        <td className="px-4 py-3">Rp {formatNumber(deposit.amount ?? 0)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Final Amount')}</td>
                                        <td className="px-4 py-3">Rp {formatNumber(deposit.final_amount ?? 0)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Status')}</td>
                                        <td className="px-4 py-3">{deposit.status || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Metode')}</td>
                                        <td className="px-4 py-3">{deposit.tripay_method || deposit.payment_method || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Tripay Merchant Ref')}</td>
                                        <td className="px-4 py-3">{deposit.tripay_merchant_ref ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Tripay Reference')}</td>
                                        <td className="px-4 py-3">{deposit.tripay_reference ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Tripay Pay Code')}</td>
                                        <td className="px-4 py-3">{deposit.tripay_pay_code ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Checkout URL')}</td>
                                        <td className="px-4 py-3">
                                            {deposit.tripay_checkout_url ? (
                                                <a
                                                    href={deposit.tripay_checkout_url}
                                                    className="break-all underline"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {deposit.tripay_checkout_url}
                                                </a>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Expired')}</td>
                                        <td className="px-4 py-3">{deposit.expired_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Processed')}</td>
                                        <td className="px-4 py-3">{deposit.processed_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Dibuat')}</td>
                                        <td className="px-4 py-3">{deposit.created_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Diperbarui')}</td>
                                        <td className="px-4 py-3">{deposit.updated_at_wib ?? '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {deposit.provider_payload ? (
                            <div className="mt-4">
                                <div className="text-sm font-semibold">{t('Provider Payload')}</div>
                                <pre className="mt-2 max-h-80 overflow-auto rounded-lg border bg-muted/20 p-3 text-xs">
                                    {JSON.stringify(deposit.provider_payload, null, 2)}
                                </pre>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDepositDetail.layout = {
    breadcrumbs: [
        { title: 'Deposit', href: '/deposits' },
        { title: 'Detail', href: '#' },
    ],
};
